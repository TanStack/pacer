import { parseFunctionOrValue } from './utils'
import type { Persister } from './persister'
import type { AnyAsyncFunction, OptionalKeys } from './types'
import type { AsyncPersister } from './async-persister'

/**
 * State shape for persisting AsyncRateLimiter
 */
export interface AsyncRateLimiterState<TFn extends AnyAsyncFunction> {
  errorCount: number
  executionTimes: Array<number>
  isExecuting: boolean
  lastResult: ReturnType<TFn> | undefined
  rejectionCount: number
  settleCount: number
  successCount: number
}

/**
 * Options for configuring an async rate-limited function
 */
export interface AsyncRateLimiterOptions<TFn extends AnyAsyncFunction> {
  /**
   * Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
   * Can be a boolean or a function that returns a boolean.
   * Defaults to true.
   */
  enabled?: boolean | ((rateLimiter: AsyncRateLimiter<TFn>) => boolean)
  /**
   * Maximum number of executions allowed within the time window.
   * Can be a number or a function that returns a number.
   */
  limit: number | ((rateLimiter: AsyncRateLimiter<TFn>) => number)
  /**
   * Optional error handler for when the rate-limited function throws.
   * If provided, the handler will be called with the error and rate limiter instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (error: unknown, rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSettled?: (rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    rateLimiter: AsyncRateLimiter<TFn>,
  ) => void
  /**
   * Optional persister for saving/loading rate limiter state
   */
  persister?:
    | AsyncPersister<AsyncRateLimiterState<TFn>>
    | Persister<AsyncRateLimiterState<TFn>>
  /**
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Time window in milliseconds within which the limit applies.
   * Can be a number or a function that returns a number.
   */
  window: number | ((rateLimiter: AsyncRateLimiter<TFn>) => number)
  /**
   * Type of window to use for rate limiting
   * - 'fixed': Uses a fixed window that resets after the window period
   * - 'sliding': Uses a sliding window that allows executions as old ones expire
   * Defaults to 'fixed'
   */
  windowType?: 'fixed' | 'sliding'
}

type AsyncRateLimiterOptionsWithOptionalCallbacks = OptionalKeys<
  AsyncRateLimiterOptions<any>,
  'onError' | 'onReject' | 'onSettled' | 'onSuccess'
>

const defaultOptions: Omit<
  AsyncRateLimiterOptionsWithOptionalCallbacks,
  'limit' | 'window'
> = {
  enabled: true,
  windowType: 'fixed',
}

/**
 * A class that creates an async rate-limited function.
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
 * Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * For smoother execution patterns, consider using:
 * - Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
 * - Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)
 *
 * Rate limiting is best used for hard API limits or resource constraints. For UI updates or
 * smoothing out frequent events, throttling or debouncing usually provide better user experience.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * @example
 * ```ts
 * const rateLimiter = new AsyncRateLimiter(
 *   async (id: string) => await api.getData(id),
 *   {
 *     limit: 5,
 *     window: 1000,
 *     windowType: 'sliding',
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     },
 *     onReject: (limiter) => {
 *       console.log(`Rate limit exceeded. Try again in ${limiter.getMsUntilNextWindow()}ms`);
 *     }
 *   }
 * );
 *
 * // Will execute immediately until limit reached, then block
 * // Returns the API response directly
 * const data = await rateLimiter.maybeExecute('123');
 * ```
 */
export class AsyncRateLimiter<TFn extends AnyAsyncFunction> {
  private _state: AsyncRateLimiterState<TFn> = {
    rejectionCount: 0,
    executionTimes: [],
    errorCount: 0,
    settleCount: 0,
    successCount: 0,
    isExecuting: false,
    lastResult: undefined as ReturnType<TFn> | undefined,
  }
  private _options: AsyncRateLimiterOptionsWithOptionalCallbacks
  private _persister?:
    | AsyncPersister<AsyncRateLimiterState<TFn>>
    | Persister<AsyncRateLimiterState<TFn>>

  constructor(
    private fn: TFn,
    initialOptions: AsyncRateLimiterOptions<TFn>,
  ) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this._persister = this._options.persister
    if (this._persister) {
      // Load state
      const loadedState = this._persister.loadState(this._persister.key)
      if (loadedState instanceof Promise) {
        loadedState.then((state) => {
          if (state) {
            this.setState(state, false)
          }
        })
      } else if (loadedState) {
        this.setState(loadedState, false)
      }
    }
  }

  /**
   * Returns the current state for persistence
   */
  private getState(): AsyncRateLimiterState<TFn> {
    return { ...this._state }
  }

  /**
   * Loads state from a persisted object or updates state with a partial
   */
  private setState(
    state: Partial<AsyncRateLimiterState<TFn>>,
    save: boolean = true,
  ): void {
    this._state = { ...this._state, ...state }
    if (save) {
      this.saveState()
    }
  }

  /**
   * Saves state using the persister if available
   */
  private saveState(): void {
    if (this._persister) {
      this._persister.saveState(this._persister.key, this.getState())
    }
  }

  /**
   * Updates the rate limiter options
   */
  setOptions(newOptions: Partial<AsyncRateLimiterOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current rate limiter options
   */
  getOptions(): AsyncRateLimiterOptions<TFn> {
    return this._options
  }

  /**
   * Returns the current enabled state of the rate limiter
   */
  getEnabled(): boolean {
    return !!parseFunctionOrValue(this._options.enabled, this)
  }

  /**
   * Returns the current limit of executions allowed within the time window
   */
  getLimit(): number {
    return parseFunctionOrValue(this._options.limit, this)
  }

  /**
   * Returns the current time window in milliseconds
   */
  getWindow(): number {
    return parseFunctionOrValue(this._options.window, this)
  }

  /**
   * Attempts to execute the rate-limited function if within the configured limits.
   * Will reject execution if the number of calls in the current window exceeds the limit.
   * If execution is allowed, waits for any previous execution to complete before proceeding.
   *
   * Error Handling:
   * - If the rate-limited function throws and no `onError` handler is configured,
   *   the error will be thrown from this method.
   * - If an `onError` handler is configured, errors will be caught and passed to the handler,
   *   and this method will return undefined.
   * - If the rate limit is exceeded, the execution will be rejected and the `onReject` handler
   *   will be called if configured.
   * - The error state can be checked using `getErrorCount()` and `getIsExecuting()`.
   * - Rate limit rejections can be tracked using `getRejectionCount()`.
   *
   * @returns A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError
   * @throws The error from the rate-limited function if no onError handler is configured
   *
   * @example
   * ```ts
   * const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });
   *
   * // First 5 calls will execute
   * await rateLimiter.maybeExecute('arg1', 'arg2');
   *
   * // Additional calls within the window will be rejected
   * await rateLimiter.maybeExecute('arg1', 'arg2'); // Rejected
   * ```
   */
  async maybeExecute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    this.cleanupOldExecutions()

    const limit = this.getLimit()
    const window = this.getWindow()

    if (this._options.windowType === 'sliding') {
      // For sliding window, we can execute if we have capacity in the current window
      if (this._state.executionTimes.length < limit) {
        await this.execute(...args)
        return this._state.lastResult
      }
    } else {
      // For fixed window, we need to check if we're in a new window
      const now = Date.now()
      const oldestExecution = Math.min(...this._state.executionTimes)
      const isNewWindow = oldestExecution + window <= now

      if (isNewWindow || this._state.executionTimes.length < limit) {
        await this.execute(...args)
        return this._state.lastResult
      }
    }

    this.rejectFunction()
    return undefined
  }

  private async execute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this.getEnabled()) return
    const now = Date.now()
    this._state.executionTimes.push(now) // mutate state directly for performance
    this.setState({
      isExecuting: true,
    })

    try {
      const result = await this.fn(...args)
      this.setState({
        successCount: this._state.successCount + 1,
        lastResult: result,
      })
      this._options.onSuccess?.(result, this)
    } catch (error) {
      this.setState({
        errorCount: this._state.errorCount + 1,
      })
      this._options.onError?.(error, this)
      if (this._options.throwOnError) {
        throw error
      } else {
        console.error(error)
      }
    } finally {
      this.setState({
        isExecuting: false,
        settleCount: this._state.settleCount + 1,
      })
      this._options.onSettled?.(this)
    }

    return this._state.lastResult
  }

  private rejectFunction(): void {
    this.setState({
      rejectionCount: this._state.rejectionCount + 1,
    })
    this._options.onReject?.(this)
  }

  private cleanupOldExecutions(): void {
    const now = Date.now()
    const windowStart = now - this.getWindow()
    this.setState({
      executionTimes: this._state.executionTimes.filter(
        (time) => time > windowStart,
      ),
    })
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow(): number {
    this.cleanupOldExecutions()
    return Math.max(0, this.getLimit() - this._state.executionTimes.length)
  }

  /**
   * Returns the number of milliseconds until the next execution will be possible
   * For fixed windows, this is the time until the current window resets
   * For sliding windows, this is the time until the oldest execution expires
   */
  getMsUntilNextWindow(): number {
    if (this.getRemainingInWindow() > 0) {
      return 0
    }
    const oldestExecution = this._state.executionTimes[0] ?? Infinity
    return oldestExecution + this.getWindow() - Date.now()
  }

  /**
   * Returns the number of times the function has been executed
   */
  getSuccessCount(): number {
    return this._state.successCount
  }

  /**
   * Returns the number of times the function has been settled
   */
  getSettleCount(): number {
    return this._state.settleCount
  }

  /**
   * Returns the number of times the function has errored
   */
  getErrorCount(): number {
    return this._state.errorCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount(): number {
    return this._state.rejectionCount
  }

  /**
   * Returns whether the function is currently executing
   */
  getIsExecuting(): boolean {
    return this._state.isExecuting
  }

  /**
   * Resets the rate limiter state
   */
  reset(): void {
    this.setState({
      executionTimes: [],
      rejectionCount: 0,
      errorCount: 0,
      settleCount: 0,
      successCount: 0,
      isExecuting: false,
      lastResult: undefined,
    })
  }
}

/**
 * Creates an async rate-limited function that will execute the provided function up to a maximum number of times within a time window.
 *
 * Unlike the non-async rate limiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * Note that rate limiting is a simpler form of execution control compared to throttling or debouncing:
 * - A rate limiter will allow all executions until the limit is reached, then block all subsequent calls until the window resets
 * - A throttler ensures even spacing between executions, which can be better for consistent performance
 * - A debouncer collapses multiple calls into one, which is better for handling bursts of events
 *
 * Consider using throttle() or debounce() if you need more intelligent execution control. Use rate limiting when you specifically
 * need to enforce a hard limit on the number of executions within a time period.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * @example
 * ```ts
 * // Rate limit to 5 calls per minute with a sliding window
 * const rateLimited = asyncRateLimit(makeApiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 *   onError: (error) => {
 *     console.error('API call failed:', error);
 *   },
 *   onReject: (rateLimiter) => {
 *     console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // First 5 calls will execute immediately
 * // Additional calls will be rejected until the minute window resets
 * // Returns the API response directly
 * const result = await rateLimited();
 *
 * // For more even execution, consider using throttle instead:
 * const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
 * ```
 */
export function asyncRateLimit<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncRateLimiterOptions<TFn>,
) {
  const rateLimiter = new AsyncRateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
