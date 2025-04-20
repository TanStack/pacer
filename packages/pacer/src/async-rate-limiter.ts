import type { RateLimitRejectionInfo } from './rate-limiter'

/**
 * Options for configuring an async rate-limited function
 */
export interface AsyncRateLimiterOptions<
  TFn extends (...args: Array<any>) => Promise<any>,
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
   * Optional error handler for when the rate-limited function throws
   */
  onError?: (error: unknown) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onExecute?: (rateLimiter: AsyncRateLimiter<TFn, TArgs>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (info: RateLimitRejectionInfo) => void
  /**
   * Time window in milliseconds within which the limit applies
   */
  window: number
}

const defaultOptions: Required<
  Omit<AsyncRateLimiterOptions<any, any>, 'limit' | 'window'>
> = {
  enabled: true,
  onReject: () => {},
  onError: () => {},
  onExecute: () => {},
}
/**
 * A class that creates an async rate-limited function.
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
 * const rateLimiter = new AsyncRateLimiter(
 *   async (id: string) => await api.getData(id),
 *   { limit: 5, window: 1000 } // 5 calls per second
 * );
 *
 * // Will execute immediately until limit reached, then block
 * await rateLimiter.maybeExecute('123');
 * ```
 */
export class AsyncRateLimiter<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
  private rejectionCount = 0
  private executionTimes: Array<number> = []
  private options: AsyncRateLimiterOptions<TFn, TArgs>

  constructor(
    private fn: TFn,
    initialOptions: AsyncRateLimiterOptions<TFn, TArgs>,
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
    newOptions: Partial<AsyncRateLimiterOptions<TFn, TArgs>>,
  ): AsyncRateLimiterOptions<TFn, TArgs> {
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
  async maybeExecute(...args: TArgs): Promise<boolean> {
    this.cleanupOldExecutions()

    if (this.executionTimes.length < this.options.limit) {
      await this.executeFunction(...args)
      return true
    }

    this.rejectFunction()
    return false
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    if (!this.options.enabled) return
    const now = Date.now()
    this.executionCount++
    this.executionTimes.push(now)

    try {
      await this.fn(...args)
    } catch (error) {
      if (this.options.onError) {
        try {
          this.options.onError(error)
        } catch {
          // Ignore errors from error handler
        }
      }
      throw error
    } finally {
      this.options.onExecute?.(this)
    }
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
 * Creates an async rate-limited function that will execute the provided function up to a maximum number of times within a time window.
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
 * const rateLimited = asyncRateLimit(makeApiCall, {
 *   limit: 5,
 *   window: 60000,
 *   onReject: ({ msUntilNextWindow }) => {
 *     console.log(`Rate limit exceeded. Try again in ${msUntilNextWindow}ms`);
 *   }
 * });
 *
 * // First 5 calls will execute immediately
 * // Additional calls will be rejected until the minute window resets
 * await rateLimited();
 *
 * // For more even execution, consider using throttle instead:
 * const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
 * ```
 */
export function asyncRateLimit<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
>(
  fn: TFn,
  initialOptions: Omit<AsyncRateLimiterOptions<TFn, TArgs>, 'enabled'>,
) {
  const rateLimiter = new AsyncRateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
