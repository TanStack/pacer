/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions {
  /**
   * Time window in milliseconds during which the function can only be executed once
   * Defaults to 1000ms
   */
  wait?: number
  /**
   * Optional error handler for when the throttled function throws
   */
  onError?: (error: unknown) => void
}

/**
 * A class that creates an async throttled function.
 */
export class AsyncThrottler<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
  private isExecuting = false
  private isScheduled = false
  private lastArgs: TArgs | undefined
  private nextExecutionTime = 0
  private options: Required<AsyncThrottlerOptions>

  constructor(
    private fn: TFn,
    options: AsyncThrottlerOptions = {},
  ) {
    this.options = {
      wait: 1000,
      onError: () => {},
      ...options,
    }
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this.executionCount
  }

  /**
   * Returns the next execution time
   */
  getNextExecutionTime(): number {
    return this.nextExecutionTime
  }

  /**
   * Executes the throttled async function
   */
  async throttle(...args: TArgs): Promise<void> {
    this.lastArgs = args
    if (this.isScheduled) return
    this.isScheduled = true

    while (this.isExecuting) {
      await new Promise((resolve) => setTimeout(resolve, this.options.wait))
    }

    while (Date.now() < this.nextExecutionTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.nextExecutionTime - Date.now()),
      )
    }

    this.isScheduled = false
    this.isExecuting = true

    try {
      await this.executeFunction(...this.lastArgs)
    } catch (error) {
      try {
        this.options.onError(error)
      } catch {
        // Ignore errors from error handler
      }
    }

    this.nextExecutionTime = Date.now() + this.options.wait
    this.isExecuting = false
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    this.executionCount++
    await this.fn(...args)
  }
}
