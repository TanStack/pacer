/**
 * Options for configuring a rate-limited function
 */
export interface RateLimitRejectionInfo {
  /**
   * Number of milliseconds until the next execution will be possible
   */
  msUntilNextWindow: number
  /**
   * Current number of executions in the window
   */
  currentExecutions: number
  /**
   * Maximum allowed executions per window
   */
  limit: number
  /**
   * Total number of rejections that have occurred
   */
  rejectionCount: number
}

export interface RateLimiterOptions {
  /**
   * Maximum number of executions allowed within the time window
   */
  limit: number
  /**
   * Time window in milliseconds within which the limit applies
   */
  window: number
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (info: RateLimitRejectionInfo) => void
}

/**
 * A class that creates a rate-limited function.
 */
export class RateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
  private rejectionCount = 0
  private executionTimes: Array<number> = []
  private options: RateLimiterOptions

  constructor(
    private fn: TFn,
    options: RateLimiterOptions,
  ) {
    this.options = options
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
   * Returns the number of remaining executions in the current window
   */
  getRemainingExecutions(): number {
    this.cleanupOldExecutions()
    return Math.max(0, this.options.limit - this.executionTimes.length)
  }

  /**
   * Executes the rate-limited function if within limits
   * @returns boolean indicating whether the function was executed
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
    const now = Date.now()
    this.executionCount++
    this.executionTimes.push(now)
    this.fn(...args)
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

export function rateLimit<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: RateLimiterOptions,
) {
  const rateLimiter = new RateLimiter(fn, options)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
