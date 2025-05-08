import type { AnyFunction } from './types'

/**
 * Options for configuring a rate-limited function
 */
export interface RateLimiterOptions<TFn extends AnyFunction> {
  /**
   * Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
  /**
   * Maximum number of executions allowed within the time window
   */
  limit: number
  /**
   * Callback function that is called after the function is executed
   */
  onExecute?: (rateLimiter: RateLimiter<TFn>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (rateLimiter: RateLimiter<TFn>) => void
  /**
   * Time window in milliseconds within which the limit applies
   */
  window: number
  /**
   * Type of window to use for rate limiting
   * - 'fixed': Uses a fixed window that resets after the window period
   * - 'sliding': Uses a sliding window that allows executions as old ones expire
   * Defaults to 'fixed'
   */
  windowType?: 'fixed' | 'sliding'
}

const defaultOptions: Required<RateLimiterOptions<any>> = {
  enabled: true,
  limit: 1,
  onExecute: () => {},
  onReject: () => {},
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
 * @example
 * ```ts
 * const rateLimiter = new RateLimiter(
 *   (id: string) => api.getData(id),
 *   { limit: 5, window: 1000, windowType: 'sliding' } // 5 calls per second with sliding window
 * );
 *
 * // Will execute immediately until limit reached, then block
 * rateLimiter.maybeExecute('123');
 * ```
 */
export class RateLimiter<TFn extends AnyFunction> {
  private _executionCount = 0
  private _rejectionCount = 0
  private _executionTimes: Array<number> = []
  private _options: RateLimiterOptions<TFn>

  constructor(
    private fn: TFn,
    initialOptions: RateLimiterOptions<TFn>,
  ) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the rate limiter options
   * Returns the new options state
   */
  setOptions(newOptions: Partial<RateLimiterOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current rate limiter options
   */
  getOptions(): Required<RateLimiterOptions<TFn>> {
    return this._options as Required<RateLimiterOptions<TFn>>
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
    this.cleanupOldExecutions()

    if (this._options.windowType === 'sliding') {
      // For sliding window, we can execute if we have capacity in the current window
      if (this._executionTimes.length < this._options.limit) {
        this.executeFunction(...args)
        return true
      }
    } else {
      // For fixed window, we need to check if we're in a new window
      const now = Date.now()
      const oldestExecution = Math.min(...this._executionTimes)
      const isNewWindow = oldestExecution + this._options.window <= now

      if (isNewWindow || this._executionTimes.length < this._options.limit) {
        this.executeFunction(...args)
        return true
      }
    }

    this.rejectFunction()
    return false
  }

  private executeFunction(...args: Parameters<TFn>): void {
    if (!this._options.enabled) return
    const now = Date.now()
    this._executionCount++
    this._executionTimes.push(now)
    this.fn(...args) // execute the function
    this._options.onExecute?.(this)
  }

  private rejectFunction(): void {
    this._rejectionCount++
    if (this._options.onReject) {
      this._options.onReject(this)
    }
  }

  private cleanupOldExecutions(): void {
    const now = Date.now()
    const windowStart = now - this._options.window
    this._executionTimes = this._executionTimes.filter(
      (time) => time > windowStart,
    )
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this._executionCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow(): number {
    this.cleanupOldExecutions()
    return Math.max(0, this._options.limit - this._executionTimes.length)
  }

  /**
   * Returns the number of milliseconds until the next execution will be possible
   */
  getMsUntilNextWindow(): number {
    if (this.getRemainingInWindow() > 0) {
      return 0
    }
    const oldestExecution = Math.min(...this._executionTimes)
    return oldestExecution + this._options.window - Date.now()
  }

  /**
   * Resets the rate limiter state
   */
  reset(): void {
    this._executionTimes = []
    this._executionCount = 0
    this._rejectionCount = 0
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
  initialOptions: Omit<RateLimiterOptions<TFn>, 'enabled'>,
) {
  const rateLimiter = new RateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
