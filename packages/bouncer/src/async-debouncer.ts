/**
 * Options for configuring an async debounced function
 */
export interface AsyncDebouncerOptions {
  /**
   * Delay in milliseconds to wait after the last call before executing
   * Defaults to 1000ms
   */
  wait: number
  /**
   * Optional error handler for when the debounced function throws
   */
  onError?: (error: unknown) => void
}

/**
 * A class that creates an async debounced function.
 */
export class AsyncDebouncer<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
> {
  private abortController: AbortController | null = null
  private executionCount = 0
  private isExecuting = false
  private lastArgs: TArgs | undefined
  private options: Required<AsyncDebouncerOptions>
  private timeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(
    private fn: TFn,
    options: AsyncDebouncerOptions,
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
   * Cancels any pending execution
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this.lastArgs = undefined
  }

  /**
   * Executes the debounced async function
   */
  async maybeExecute(...args: TArgs): Promise<void> {
    this.cancel()
    this.lastArgs = args

    return new Promise((resolve) => {
      this.timeoutId = setTimeout(async () => {
        if (this.isExecuting) {
          resolve()
          return
        }

        this.abortController = new AbortController()
        try {
          this.isExecuting = true
          if (this.lastArgs) {
            await this.executeFunction(...this.lastArgs)
          }
        } catch (error) {
          try {
            this.options.onError(error)
          } catch {
            // Ignore errors from error handler
          }
        } finally {
          this.isExecuting = false
          this.abortController = null
          resolve()
        }
      }, this.options.wait)
    })
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    this.executionCount++
    await this.fn(...args)
  }
}
