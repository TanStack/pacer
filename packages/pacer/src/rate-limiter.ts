import { parseFunctionOrValue } from './utils'
import type { AnyFunction } from './types'

/**
 * State shape for persisting RateLimiter
 */
export interface RateLimiterState {
  executionCount: number
  executionTimes: Array<number>
  rejectionCount: number
}

/**
 * Options for configuring a rate-limited function
 */
export interface RateLimiterOptions<TFn extends AnyFunction> {
  /**
   * Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean | ((rateLimiter: RateLimiter<TFn>) => boolean)
  /**
   * Initial state for the rate limiter
   */
  initialState?: Partial<RateLimiterState>
  /**
   * Maximum number of executions allowed within the time window.
   * Can be a number or a callback function that receives the rate limiter instance and returns a number.
   */
  limit: number | ((rateLimiter: RateLimiter<TFn>) => number)
  /**
   * Callback function that is called after the function is executed
   */
  onExecute?: (rateLimiter: RateLimiter<TFn>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (rateLimiter: RateLimiter<TFn>) => void
  /**
   * Callback function that is called when the state of the rate limiter is updated
   */
  onStateChange?: (state: RateLimiterState) => void
  /**
   * Time window in milliseconds within which the limit applies.
   * Can be a number or a callback function that receives the rate limiter instance and returns a number.
   */
  window: number | ((rateLimiter: RateLimiter<TFn>) => number)
  /**
   * Type of window to use for rate limiting
   * - 'fixed': Uses a fixed window that resets after the window period
   * - 'sliding': Uses a sliding window that allows executions as old ones expire
   * Defaults to 'fixed'
   */
  windowType?: 'fixed' | 'sliding'
}

const defaultOptions: Omit<
  Required<RateLimiterOptions<any>>,
  'initialState' | 'onStateChange' | 'onExecute' | 'onReject'
> = {
  enabled: true,
  limit: 1,
  window: 0,
  windowType: 'fixed',
}

/**
 * A class that creates a rate-limited function.
 *
 * Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
 * then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
 * all executions happen immediately, followed by a complete block.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * For smoother execution patterns, consider using:
 * - Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
 * - Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)
 *
 * Rate limiting is best used for hard API limits or resource constraints. For UI updates or
 * smoothing out frequent events, throttling or debouncing usually provide better user experience.
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count, execution times, and rejection count
 * - State can be retrieved using `getState()` method
 *
 * @example
 * ```ts
 * const rateLimiter = new RateLimiter(
 *   (id: string) => api.getData(id),
 *   {
 *     limit: 5,
 *     window: 1000,
 *     windowType: 'sliding',
 *   }
 * );
 *
 * // Will execute immediately until limit reached, then block
 * rateLimiter.maybeExecute('123');
 * ```
 */
export class RateLimiter<TFn extends AnyFunction> {
  #options: RateLimiterOptions<TFn>
  #state: RateLimiterState = {
    executionCount: 0,
    executionTimes: [],
    rejectionCount: 0,
  }

  constructor(
    private fn: TFn,
    initialOptions: RateLimiterOptions<TFn>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
    }
    this.#state = {
      ...this.#state,
      ...this.#options.initialState,
    }
  }

  /**
   * Updates the rate limiter options
   */
  setOptions(newOptions: Partial<RateLimiterOptions<TFn>>): void {
    this.#options = { ...this.#options, ...newOptions }
  }

  /**
   * Returns the current rate limiter options
   */
  getOptions(): Required<RateLimiterOptions<TFn>> {
    return this.#options as Required<RateLimiterOptions<TFn>>
  }

  /**
   * Returns the current state for persistence
   */
  getState(): RateLimiterState {
    return { ...this.#state }
  }

  /**
   * Loads state from a persisted object or updates state with a partial
   */
  #setState(state: Partial<RateLimiterState>): void {
    this.#state = { ...this.#state, ...state }
    this.#options.onStateChange?.(this.#state)
  }

  /**
   * Returns the current enabled state of the rate limiter
   */
  getEnabled(): boolean {
    return parseFunctionOrValue(this.#options.enabled, this)!
  }

  /**
   * Returns the current limit of executions allowed within the time window
   */
  getLimit(): number {
    return parseFunctionOrValue(this.#options.limit, this)
  }

  /**
   * Returns the current time window in milliseconds
   */
  getWindow(): number {
    return parseFunctionOrValue(this.#options.window, this)
  }

  /**
   * Attempts to execute the rate-limited function if within the configured limits.
   * Will reject execution if the number of calls in the current window exceeds the limit.
   *
   * @example
   * ```ts
   * const rateLimiter = new RateLimiter(fn, { limit: 5, window: 1000 });
   *
   * // First 5 calls will return true
   * rateLimiter.maybeExecute('arg1', 'arg2'); // true
   *
   * // Additional calls within the window will return false
   * rateLimiter.maybeExecute('arg1', 'arg2'); // false
   * ```
   */
  maybeExecute(...args: Parameters<TFn>): boolean {
    this.#cleanupOldExecutions()

    if (this.#options.windowType === 'sliding') {
      // For sliding window, we can execute if we have capacity in the current window
      if (this.#state.executionTimes.length < this.getLimit()) {
        this.#execute(...args)
        return true
      }
    } else {
      // For fixed window, we need to check if we're in a new window
      const now = Date.now()
      const oldestExecution = Math.min(...this.#state.executionTimes)
      const isNewWindow = oldestExecution + this.getWindow() <= now

      if (isNewWindow || this.#state.executionTimes.length < this.getLimit()) {
        this.#execute(...args)
        return true
      }
    }

    this.#rejectFunction()
    return false
  }

  #execute(...args: Parameters<TFn>): void {
    if (!this.getEnabled()) return
    const now = Date.now()
    this.fn(...args) // EXECUTE!
    this.#state.executionTimes.push(now) // mutate state directly for performance
    this.#setState({
      executionCount: this.#state.executionCount + 1,
    })
    this.#options.onExecute?.(this)
  }

  #rejectFunction(): void {
    this.#setState({
      rejectionCount: this.#state.rejectionCount + 1,
    })
    this.#options.onReject?.(this)
  }

  #cleanupOldExecutions(): void {
    const now = Date.now()
    const windowStart = now - this.getWindow()
    this.#setState({
      executionTimes: this.#state.executionTimes.filter(
        (time) => time > windowStart,
      ),
    })
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this.#state.executionCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount(): number {
    return this.#state.rejectionCount
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow(): number {
    this.#cleanupOldExecutions()
    return Math.max(0, this.getLimit() - this.#state.executionTimes.length)
  }

  /**
   * Returns the number of milliseconds until the next execution will be possible
   */
  getMsUntilNextWindow(): number {
    if (this.getRemainingInWindow() > 0) {
      return 0
    }
    const oldestExecution = this.#state.executionTimes[0] ?? Infinity
    return oldestExecution + this.getWindow() - Date.now()
  }

  /**
   * Resets the rate limiter state
   */
  reset(): void {
    this.#setState({
      executionTimes: [],
      executionCount: 0,
      rejectionCount: 0,
    })
  }
}

/**
 * Creates a rate-limited function that will execute the provided function up to a maximum number of times within a time window.
 *
 * Note that rate limiting is a simpler form of execution control compared to throttling or debouncing:
 * - A rate limiter will allow all executions until the limit is reached, then block all subsequent calls until the window resets
 * - A throttler ensures even spacing between executions, which can be better for consistent performance
 * - A debouncer collapses multiple calls into one, which is better for handling bursts of events
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count, execution times, and rejection count
 *
 * Consider using throttle() or debounce() if you need more intelligent execution control. Use rate limiting when you specifically
 * need to enforce a hard limit on the number of executions within a time period.
 *
 * @example
 * ```ts
 * // Rate limit to 5 calls per minute with a sliding window
 * const rateLimited = rateLimit(makeApiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 *   onReject: (rateLimiter) => {
 *     console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // First 5 calls will execute immediately
 * // Additional calls will be rejected until the minute window resets
 * rateLimited();
 *
 * // For more even execution, consider using throttle instead:
 * const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
 * ```
 */
export function rateLimit<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: RateLimiterOptions<TFn>,
) {
  const rateLimiter = new RateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
