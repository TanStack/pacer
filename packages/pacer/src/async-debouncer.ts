import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async debounced function
 */
export interface AsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
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
 * const asyncDebouncer = new AsyncDebouncer(async (value: string) => {
 *   await searchAPI(value);
 * }, { wait: 500 });
 *
 * // Called on each keystroke but only executes after 500ms of no typing
 * inputElement.addEventListener('input', () => {
 *   asyncDebouncer.maybeExecute(inputElement.value);
 * });
 * ```
 */
export class AsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
> {
  private _abortController: AbortController | null = null
  private _executionCount = 0
  private _isExecuting = false
  private _lastArgs: TArgs | undefined
  private _options: Required<AsyncDebouncerOptions<TFn, TArgs>>
  private _timeoutId: ReturnType<typeof setTimeout> | null = null
  private _canLeadingExecute = true

  constructor(
    private fn: TFn,
    initialOptions: AsyncDebouncerOptions<TFn, TArgs>,
  ) {
    this._options = {
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
    this._options = {
      ...this._options,
      ...newOptions,
    }
    return this._options
  }

  /**
   * Returns the current debouncer options
   */
  getOptions(): Required<AsyncDebouncerOptions<TFn, TArgs>> {
    return this._options
  }

  /**
   * Attempts to execute the debounced function
   * If a call is already in progress, it will be queued
   */
  async maybeExecute(...args: TArgs): Promise<void> {
    this.cancel()
    this._lastArgs = args

    // Handle leading execution
    if (this._options.leading && this._canLeadingExecute) {
      this._canLeadingExecute = false
      await this.executeFunction(...args)
    }

    return new Promise((resolve) => {
      this._timeoutId = setTimeout(async () => {
        if (this._isExecuting) {
          resolve()
          return
        }

        this._canLeadingExecute = true
        // Execute trailing only if enabled
        if (this._options.trailing) {
          this._abortController = new AbortController()
          try {
            this._isExecuting = true
            if (this._lastArgs) {
              await this.executeFunction(...this._lastArgs)
            }
          } catch (error) {
            try {
              this._options.onError(error)
            } catch {
              console.error('Error in error handler', error)
            }
          } finally {
            this._isExecuting = false
            this._abortController = null
            resolve()
          }
        } else {
          resolve()
        }
      }, this._options.wait)
    })
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    if (!this._options.enabled) return
    this._executionCount++
    await this.fn(...args)
    this._options.onExecute(this)
  }

  /**
   * Cancels any pending execution
   */
  cancel(): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    this._lastArgs = undefined
    this._canLeadingExecute = true
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this._executionCount
  }

  /**
   * Returns `true` if there is a pending execution
   */
  getIsPending(): boolean {
    return (
      this._options.enabled && (this._timeoutId !== null || this._isExecuting)
    )
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
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
>(fn: TFn, initialOptions: Omit<AsyncDebouncerOptions<TFn, TArgs>, 'enabled'>) {
  const asyncDebouncer = new AsyncDebouncer(fn, initialOptions)
  return asyncDebouncer.maybeExecute.bind(asyncDebouncer)
}
