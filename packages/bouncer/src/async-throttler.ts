/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions {
  /**
   * Time window in milliseconds during which the function can only be executed once
   * Defaults to 1000ms
   */
  wait: number
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
  private abortController: AbortController | null = null
  private executionCount = 0
  private isExecuting = false
  private isScheduled = false
  private lastArgs: TArgs | undefined
  private nextExecutionTime = 0
  private options: Required<AsyncThrottlerOptions>

  constructor(
    private fn: TFn,
    options: AsyncThrottlerOptions,
  ) {
    this.options = {
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
   * Cancels any pending execution
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this.isScheduled = false
    this.lastArgs = undefined
  }

  /**
   * Executes the throttled async function
   */
  async throttle(...args: TArgs): Promise<void> {
    this.lastArgs = args
    if (this.isScheduled) return
    this.isScheduled = true

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    try {
      while (this.isExecuting) {
        await this.delay(this.options.wait, signal)
      }

      while (Date.now() < this.nextExecutionTime) {
        await this.delay(this.nextExecutionTime - Date.now(), signal)
      }

      this.isScheduled = false
      this.isExecuting = true

      await this.executeFunction(...this.lastArgs)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Silent return on cancellation
      }
      try {
        this.options.onError(error)
      } catch {
        // Ignore errors from error handler
      }
    } finally {
      this.nextExecutionTime = Date.now() + this.options.wait
      this.isExecuting = false
      this.abortController = null
    }
  }

  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          reject(new Error('AbortError'))
        },
        { once: true },
      )
    })
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    this.executionCount++
    await this.fn(...args)
  }
}
