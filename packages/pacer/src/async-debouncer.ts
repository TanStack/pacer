/**
 * Options for configuring an async debounced function
 */
export interface AsyncDebouncerOptions<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
> {
  /**
   * Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Optional error handler for when the debounced function throws
   */
  onError?: (error: unknown) => void
  /**
   * Optional function to call when the debounced function is executed
   */
  onExecute?: (debouncer: AsyncDebouncer<TFn, TArgs>) => void
  /**
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true.
   */
  trailing?: boolean
  /**
   * Delay in milliseconds to wait after the last call before executing
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<AsyncDebouncerOptions<any, any>> = {
  enabled: true,
  leading: false,
  trailing: true,
  onError: () => {},
  onExecute: () => {},
  wait: 0,
}

/**
 * A class that creates an async debounced function.
 *
 * Debouncing ensures that a function is only executed after a specified delay has passed since its last invocation.
 * Each new invocation resets the delay timer. This is useful for handling frequent events like window resizing
 * or input changes where you only want to execute the handler after the events have stopped occurring.
 *
 * Unlike throttling which allows execution at regular intervals, debouncing prevents any execution until
 * the function stops being called for the specified delay period.
 *
 * @example
 * ```ts
 * const debouncer = new AsyncDebouncer(async (value: string) => {
 *   await searchAPI(value);
 * }, { wait: 500 });
 *
 * // Called on each keystroke but only executes after 500ms of no typing
 * inputElement.addEventListener('input', () => {
 *   debouncer.maybeExecute(inputElement.value);
 * });
 * ```
 */
export class AsyncDebouncer<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
> {
  private abortController: AbortController | null = null
  private executionCount = 0
  private isExecuting = false
  private lastArgs: TArgs | undefined
  private options: Required<AsyncDebouncerOptions<TFn, TArgs>>
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private canLeadingExecute = true

  constructor(
    private fn: TFn,
    initialOptions: AsyncDebouncerOptions<TFn, TArgs>,
  ) {
    this.options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the debouncer options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<AsyncDebouncerOptions<TFn, TArgs>>,
  ): Required<AsyncDebouncerOptions<TFn, TArgs>> {
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
    this.canLeadingExecute = true
  }

  /**
   * Attempts to execute the debounced function
   * If a call is already in progress, it will be queued
   */
  async maybeExecute(...args: TArgs): Promise<void> {
    this.cancel()
    this.lastArgs = args

    // Handle leading execution
    if (this.options.leading && this.canLeadingExecute) {
      this.canLeadingExecute = false
      await this.executeFunction(...args)
    }

    return new Promise((resolve) => {
      this.timeoutId = setTimeout(async () => {
        if (this.isExecuting) {
          resolve()
          return
        }

        this.canLeadingExecute = true
        // Execute trailing only if enabled
        if (this.options.trailing) {
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
        } else {
          resolve()
        }
      }, this.options.wait)
    })
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    if (!this.options.enabled) return
    this.executionCount++
    await this.fn(...args)
    this.options.onExecute(this)
  }
}

/**
 * Creates an async debounced function that delays execution until after a specified wait time.
 * The debounced function will only execute once the wait period has elapsed without any new calls.
 * If called again during the wait period, the timer resets and a new wait period begins.
 *
 * @example
 * ```ts
 * const debounced = asyncDebounce(async (value: string) => {
 *   await saveToAPI(value);
 * }, { wait: 1000 });
 *
 * // Will only execute once, 1 second after the last call
 * await debounced("first");  // Cancelled
 * await debounced("second"); // Cancelled
 * await debounced("third");  // Executes after 1s
 * ```
 */
export function asyncDebounce<
  TFn extends (...args: Array<any>) => Promise<any>,
  TArgs extends Parameters<TFn>,
>(fn: TFn, initialOptions: Omit<AsyncDebouncerOptions<TFn, TArgs>, 'enabled'>) {
  const asyncDebouncer = new AsyncDebouncer(fn, initialOptions)
  return asyncDebouncer.maybeExecute.bind(asyncDebouncer)
}
