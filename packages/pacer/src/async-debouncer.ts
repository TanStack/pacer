import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async debounced function
 */
export interface AsyncDebouncerOptions<TFn extends AnyAsyncFunction> {
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
  onError?: (error: unknown, debouncer: AsyncDebouncer<TFn>) => void
  /**
   * Optional callback to call when the debounced function is executed
   */
  onSettled?: (debouncer: AsyncDebouncer<TFn>) => void
  /**
   * Optional callback to call when the debounced function is executed
   */
  onSuccess?: (result: ReturnType<TFn>, debouncer: AsyncDebouncer<TFn>) => void
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

const defaultOptions: Required<AsyncDebouncerOptions<any>> = {
  enabled: true,
  leading: false,
  onError: () => {},
  onSettled: () => {},
  onSuccess: () => {},
  trailing: true,
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
 * Unlike the non-async Debouncer, this async version supports returning values from the debounced function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the debounced function.
 *
 * @example
 * ```ts
 * const asyncDebouncer = new AsyncDebouncer(async (value: string) => {
 *   const results = await searchAPI(value);
 *   return results; // Return value is preserved
 * }, { wait: 500 });
 *
 * // Called on each keystroke but only executes after 500ms of no typing
 * // Returns the API response directly
 * const results = await asyncDebouncer.maybeExecute(inputElement.value);
 * ```
 */
export class AsyncDebouncer<TFn extends AnyAsyncFunction> {
  private _abortController: AbortController | null = null
  private _canLeadingExecute = true
  private _errorCount = 0
  private _isExecuting = false
  private _isPending = false
  private _lastArgs: Parameters<TFn> | undefined
  private _lastResult: ReturnType<TFn> | undefined
  private _options: Required<AsyncDebouncerOptions<TFn>>
  private _settleCount = 0
  private _successCount = 0
  private _timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: TFn,
    initialOptions: AsyncDebouncerOptions<TFn>,
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
  setOptions(newOptions: Partial<AsyncDebouncerOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }

    // End the pending state if the debouncer is disabled
    if (!this._options.enabled) {
      this._isPending = false
    }
  }

  /**
   * Returns the current debouncer options
   */
  getOptions(): Required<AsyncDebouncerOptions<TFn>> {
    return this._options
  }

  /**
   * Attempts to execute the debounced function
   * If a call is already in progress, it will be queued
   */
  async maybeExecute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    this._cancel()
    this._lastArgs = args

    // Handle leading execution
    if (this._options.leading && this._canLeadingExecute) {
      this._canLeadingExecute = false
      await this.executeFunction(...args)
      return this._lastResult
    }

    // Handle trailing execution
    if (this._options.trailing) {
      this._isPending = true
    }

    return new Promise((resolve) => {
      this._timeoutId = setTimeout(async () => {
        // Execute trailing if enabled
        if (this._options.trailing && this._lastArgs) {
          await this.executeFunction(...this._lastArgs)
        }

        // Reset state and resolve
        this._canLeadingExecute = true
        resolve(this._lastResult)
      }, this._options.wait)
    })
  }

  private async executeFunction(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this._options.enabled) return undefined
    this._abortController = new AbortController()
    try {
      this._isExecuting = true
      this._lastResult = await this.fn(...args) // EXECUTE!
      this._successCount++
      this._options.onSuccess(this._lastResult!, this)
    } catch (error) {
      this._errorCount++
      this._options.onError(error, this)
    } finally {
      this._isExecuting = false
      this._isPending = false
      this._settleCount++
      this._abortController = null
      this._options.onSettled(this)
    }
    return this._lastResult
  }

  /**
   * Cancel without resetting _canLeadingExecute
   */
  private _cancel(): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    this._lastArgs = undefined
    this._isPending = false
    this._isExecuting = false
  }

  /**
   * Cancels any pending execution or aborts any execution in progress
   */
  cancel(): void {
    this._canLeadingExecute = true
    this._cancel()
  }

  /**
   * Returns the last result of the debounced function
   */
  getLastResult(): ReturnType<TFn> | undefined {
    return this._lastResult
  }

  /**
   * Returns the number of times the function has been executed successfully
   */
  getSuccessCount(): number {
    return this._successCount
  }

  /**
   * Returns the number of times the function has settled (completed or errored)
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
   * Returns `true` if there is a pending execution queued up for trailing execution
   */
  getIsPending(): boolean {
    return this._options.enabled && this._isPending
  }

  /**
   * Returns `true` if there is currently an execution in progress
   */
  getIsExecuting(): boolean {
    return this._isExecuting
  }
}

/**
 * Creates an async debounced function that delays execution until after a specified wait time.
 * The debounced function will only execute once the wait period has elapsed without any new calls.
 * If called again during the wait period, the timer resets and a new wait period begins.
 *
 * Unlike the non-async Debouncer, this async version supports returning values from the debounced function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the debounced function.
 *
 * @example
 * ```ts
 * const debounced = asyncDebounce(async (value: string) => {
 *   const result = await saveToAPI(value);
 *   return result; // Return value is preserved
 * }, { wait: 1000 });
 *
 * // Will only execute once, 1 second after the last call
 * // Returns the API response directly
 * const result = await debounced("third");
 * ```
 */
export function asyncDebounce<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: Omit<AsyncDebouncerOptions<TFn>, 'enabled'>,
) {
  const asyncDebouncer = new AsyncDebouncer(fn, initialOptions)
  return asyncDebouncer.maybeExecute.bind(asyncDebouncer)
}
