import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions<TFn extends AnyAsyncFunction> {
  /**
   * Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
  /**
   * Whether to execute the function immediately when called
   * Defaults to true
   */
  leading?: boolean
  /**
   * Optional error handler for when the throttled function throws
   */
  onError?: (error: unknown, asyncThrottler: AsyncThrottler<TFn>) => void
  /**
   * Optional function to call when the throttled function is executed
   */
  onSettled?: (asyncThrottler: AsyncThrottler<TFn>) => void
  /**
   * Optional function to call when the throttled function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    asyncThrottler: AsyncThrottler<TFn>,
  ) => void
  /**
   * Whether to execute the function on the trailing edge of the wait period
   * Defaults to true
   */
  trailing?: boolean
  /**
   * Time window in milliseconds during which the function can only be executed once
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<AsyncThrottlerOptions<any>> = {
  enabled: true,
  leading: true,
  onError: () => {},
  onSettled: () => {},
  onSuccess: () => {},
  trailing: true,
  wait: 0,
}

/**
 * A class that creates an async throttled function.
 *
 * Throttling limits how often a function can be executed, allowing only one execution within a specified time window.
 * Unlike debouncing which resets the delay timer on each call, throttling ensures the function executes at a
 * regular interval regardless of how often it's called.
 *
 * This is useful for rate-limiting API calls, handling scroll/resize events, or any scenario where you want to
 * ensure a maximum execution frequency.
 *
 * @example
 * ```ts
 * const throttler = new AsyncThrottler(async (value: string) => {
 *   await saveToAPI(value);
 * }, { wait: 1000 });
 *
 * // Will only execute once per second no matter how often called
 * inputElement.addEventListener('input', () => {
 *   throttler.maybeExecute(inputElement.value);
 * });
 * ```
 */
export class AsyncThrottler<TFn extends AnyAsyncFunction> {
  private _options: Required<AsyncThrottlerOptions<TFn>>
  private _abortController: AbortController | null = null
  private _errorCount = 0
  private _isExecuting = false
  private _lastArgs: Parameters<TFn> | undefined
  private _lastExecutionTime = 0
  private _lastResult: ReturnType<TFn> | undefined
  private _nextExecutionTime = 0
  private _settleCount = 0
  private _successCount = 0
  private _timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn>,
  ) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the throttler options
   * Returns the new options state
   */
  setOptions(newOptions: Partial<AsyncThrottlerOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }

    // End the pending state if the debouncer is disabled
    if (!this._options.enabled) {
      this.cancel()
    }
  }

  /**
   * Returns the current options
   */
  getOptions(): Required<AsyncThrottlerOptions<TFn>> {
    return this._options
  }

  /**
   * Attempts to execute the throttled function
   * If a call is already in progress, it may be blocked or queued depending on the `wait` option
   */
  async maybeExecute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    const now = Date.now()
    const timeSinceLastExecution = now - this._lastExecutionTime

    // Handle leading execution
    if (this._options.leading && timeSinceLastExecution >= this._options.wait) {
      await this.executeFunction(...args)
      return this._lastResult
    } else {
      // Store the most recent arguments for potential trailing execution
      this._lastArgs = args

      return new Promise((resolve) => {
        // Clear any existing timeout to ensure we use the latest arguments
        if (this._timeoutId) {
          clearTimeout(this._timeoutId)
        }

        // Set up trailing execution if enabled
        if (this._options.trailing) {
          const _timeSinceLastExecution = this._lastExecutionTime
            ? now - this._lastExecutionTime
            : 0
          const timeoutDuration = this._options.wait - _timeSinceLastExecution
          this._timeoutId = setTimeout(async () => {
            if (this._lastArgs !== undefined) {
              await this.executeFunction(...this._lastArgs)
            }
            resolve(this._lastResult)
          }, timeoutDuration)
        }
      })
    }
  }

  private async executeFunction(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this._options.enabled || this._isExecuting) return undefined
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
      this._settleCount++
      this._abortController = null
      this._lastExecutionTime = Date.now()
      this._nextExecutionTime = this._lastExecutionTime + this._options.wait
      this._options.onSettled(this)
    }
    return this._lastResult
  }

  /**
   * Cancels any pending execution or aborts any execution in progress
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
  }

  /**
   * Returns the last execution time
   */
  getLastExecutionTime(): number {
    return this._lastExecutionTime
  }

  /**
   * Returns the next execution time
   */
  getNextExecutionTime(): number {
    return this._nextExecutionTime
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
   * Returns the current pending state
   */
  getIsPending(): boolean {
    return this._options.enabled && !!this._timeoutId
  }

  /**
   * Returns the current executing state
   */
  getIsExecuting(): boolean {
    return this._isExecuting
  }
}

/**
 * Creates an async throttled function that limits how often the function can execute.
 * The throttled function will execute at most once per wait period, even if called multiple times.
 * If called while executing, it will wait until execution completes before scheduling the next call.
 *
 * @example
 * ```ts
 * const throttled = asyncThrottle(async () => {
 *   await someAsyncOperation();
 * }, { wait: 1000 });
 *
 * // This will execute at most once per second
 * await throttled();
 * await throttled(); // Waits 1 second before executing
 * ```
 */
export function asyncThrottle<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: Omit<AsyncThrottlerOptions<TFn>, 'enabled'>,
) {
  const asyncThrottler = new AsyncThrottler(fn, initialOptions)
  return asyncThrottler.maybeExecute.bind(asyncThrottler)
}
