/**
 * Information about a rate limit rejection
 */
export interface RateLimitRejectionInfo {
  /**
   * Current number of executions in the window
   */
  currentExecutions: number
  /**
   * Maximum allowed executions per window
   */
  limit: number
  /**
   * Number of milliseconds until the next execution will be possible
   */
  msUntilNextWindow: number
  /**
   * Total number of rejections that have occurred
   */
  rejectionCount: number
}

/**
 * Options for configuring a rate-limited function
 */
export interface RateLimiterOptions<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
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
  onExecute?: (rateLimiter: RateLimiter<TFn, TArgs>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (info: RateLimitRejectionInfo) => void
  /**
   * Time window in milliseconds within which the limit applies
   */
  window: number
}

const defaultOptions: Required<RateLimiterOptions<any, any>> = {
  enabled: true,
  limit: 1,
  onExecute: () => {},
  onReject: () => {},
  window: 0,
}

/**
 * A class that creates a rate-limited function.
 *
 * Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
 * then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
 * all executions happen immediately, followed by a complete block.
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
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // Will execute immediately until limit reached, then block
 * rateLimiter.maybeExecute('123');
 * ```
 */
export class RateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
  private rejectionCount = 0
  private executionTimes: Array<number> = []
  private options: RateLimiterOptions<TFn, TArgs>

  constructor(
    private fn: TFn,
    initialOptions: RateLimiterOptions<TFn, TArgs>,
  ) {
    this.options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the rate limiter options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<RateLimiterOptions<TFn, TArgs>>,
  ): RateLimiterOptions<TFn, TArgs> {
    this.options = {
      ...this.options,
      ...newOptions,
    }
    return this.options
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this.executionCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount(): number {
    return this.rejectionCount
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow(): number {
    this.cleanupOldExecutions()
    return Math.max(0, this.options.limit - this.executionTimes.length)
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
  maybeExecute(...args: TArgs): boolean {
    this.cleanupOldExecutions()

    if (this.executionTimes.length < this.options.limit) {
      this.executeFunction(...args)
      return true
    }

    this.rejectFunction()

    return false
  }

  private executeFunction(...args: TArgs): void {
    if (!this.options.enabled) return
    const now = Date.now()
    this.executionCount++
    this.executionTimes.push(now)
    this.fn(...args)
    this.options.onExecute?.(this)
  }

  private rejectFunction(): void {
    this.rejectionCount++
    if (this.options.onReject) {
      const oldestExecution = Math.min(...this.executionTimes)
      const msUntilNextWindow =
        oldestExecution + this.options.window - Date.now()

      this.options.onReject({
        msUntilNextWindow,
        currentExecutions: this.executionTimes.length,
        limit: this.options.limit,
        rejectionCount: this.rejectionCount,
      })
    }
  }

  private cleanupOldExecutions(): void {
    const now = Date.now()
    const windowStart = now - this.options.window
    this.executionTimes = this.executionTimes.filter(
      (time) => time > windowStart,
    )
  }

  /**
   * Resets the rate limiter state
   */
  reset(): void {
    this.executionTimes = []
    this.executionCount = 0
    this.rejectionCount = 0
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
 * Consider using throttle() or debounce() if you need more intelligent execution control. Use rate limiting when you specifically
 * need to enforce a hard limit on the number of executions within a time period.
 *
 * @example
 * ```ts
 * // Rate limit to 5 calls per minute
 * const rateLimited = rateLimit(makeApiCall, {
 *   limit: 5,
 *   window: 60000,
 *   onReject: ({ msUntilNextWindow }) => {
 *     console.log(`Rate limit exceeded. Try again in ${msUntilNextWindow}ms`);
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
export function rateLimit<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  initialOptions: Omit<RateLimiterOptions<TFn, Parameters<TFn>>, 'enabled'>,
) {
  const rateLimiter = new RateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
