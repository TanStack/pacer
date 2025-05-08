import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async rate-limited function
 */
export interface AsyncRateLimiterOptions<TFn extends AnyAsyncFunction> {
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
   * Optional error handler for when the rate-limited function throws
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

const defaultOptions: Required<
  Omit<AsyncRateLimiterOptions<any>, 'limit' | 'window'>
> = {
  enabled: true,
  onError: () => {},
  onReject: () => {},
  onSettled: () => {},
  onSuccess: () => {},
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
 * @example
 * ```ts
 * const rateLimiter = new AsyncRateLimiter(
 *   async (id: string) => await api.getData(id),
 *   { limit: 5, window: 1000, windowType: 'sliding' } // 5 calls per second with sliding window
 * );
 *
 * // Will execute immediately until limit reached, then block
 * // Returns the API response directly
 * const data = await rateLimiter.maybeExecute('123');
 * ```
 */
export class AsyncRateLimiter<TFn extends AnyAsyncFunction> {
  private _options: AsyncRateLimiterOptions<TFn>
  private _errorCount = 0
  private _executionTimes: Array<number> = []
  private _lastResult: ReturnType<TFn> | undefined
  private _rejectionCount = 0
  private _settleCount = 0
  private _successCount = 0
  private _isExecuting = false

  constructor(
    private fn: TFn,
    initialOptions: AsyncRateLimiterOptions<TFn>,
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
  setOptions(newOptions: Partial<AsyncRateLimiterOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current rate limiter options
   */
  getOptions(): Required<AsyncRateLimiterOptions<TFn>> {
    return this._options as Required<AsyncRateLimiterOptions<TFn>>
  }

  /**
   * Attempts to execute the rate-limited function if within the configured limits.
   * Will reject execution if the number of calls in the current window exceeds the limit.
   * If execution is allowed, waits for any previous execution to complete before proceeding.
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

    if (this._options.windowType === 'sliding') {
      // For sliding window, we can execute if we have capacity in the current window
      if (this._executionTimes.length < this._options.limit) {
        await this.executeFunction(...args)
        return this._lastResult
      }
    } else {
      // For fixed window, we need to check if we're in a new window
      const now = Date.now()
      const oldestExecution = Math.min(...this._executionTimes)
      const isNewWindow = oldestExecution + this._options.window <= now

      if (isNewWindow || this._executionTimes.length < this._options.limit) {
        await this.executeFunction(...args)
        return this._lastResult
      }
    }

    this.rejectFunction()
    return undefined
  }

  private async executeFunction(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this._options.enabled) return
    this._isExecuting = true
    const now = Date.now()
    this._executionTimes.push(now)

    try {
      this._lastResult = await this.fn(...args)
      this._successCount++
      this._options.onSuccess?.(this._lastResult!, this)
    } catch (error) {
      this._errorCount++
      this._options.onError?.(error, this)
    } finally {
      this._isExecuting = false
      this._settleCount++
      this._options.onSettled?.(this)
    }

    return this._lastResult
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
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow(): number {
    this.cleanupOldExecutions()
    return Math.max(0, this._options.limit - this._executionTimes.length)
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
    const oldestExecution = Math.min(...this._executionTimes)
    return oldestExecution + this._options.window - Date.now()
  }

  /**
   * Returns the number of times the function has been executed
   */
  getSuccessCount(): number {
    return this._successCount
  }

  /**
   * Returns the number of times the function has been settled
   */
  getSettleCount(): number {
    return this._settleCount
  }

  /**
   * Returns the number of times the function has errored
   */
  getErrorCount(): number {
    return this._errorCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns whether the function is currently executing
   */
  getIsExecuting(): boolean {
    return this._isExecuting
  }

  /**
   * Resets the rate limiter state
   */
  reset(): void {
    this._executionTimes = []
    this._successCount = 0
    this._errorCount = 0
    this._rejectionCount = 0
    this._settleCount = 0
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
 * @example
 * ```ts
 * // Rate limit to 5 calls per minute with a sliding window
 * const rateLimited = asyncRateLimit(makeApiCall, {
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
 * // Returns the API response directly
 * const result = await rateLimited();
 *
 * // For more even execution, consider using throttle instead:
 * const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
 * ```
 */
export function asyncRateLimit<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: Omit<AsyncRateLimiterOptions<TFn>, 'enabled'>,
) {
  const rateLimiter = new AsyncRateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
