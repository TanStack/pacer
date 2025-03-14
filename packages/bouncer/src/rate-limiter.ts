/**
 * Options for configuring a rate-limited function
 */
export interface RateLimiterOptions {
  /**
   * Maximum number of executions allowed within the time window
   */
  limit: number
  /**
   * Time window in milliseconds within which the limit applies
   */
  window: number
}

/**
 * A class that creates a rate-limited function.
 */
export class RateLimiter<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
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

    return false
  }

  private executeFunction(...args: TArgs): void {
    const now = Date.now()
    this.executionCount++
    this.executionTimes.push(now)
    this.fn(...args)
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
  }
}

export function rateLimit<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: RateLimiterOptions,
) {
  const rateLimiter = new RateLimiter(fn, options)
  return rateLimiter.maybeExecute.bind(rateLimiter)
}
