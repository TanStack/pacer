import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction, OptionalKeys } from './types'

/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions<TFn extends AnyAsyncFunction> {
  /**
   * Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
   * Can be a boolean or a function that returns a boolean.
   * Defaults to true.
   */
  enabled?: boolean | ((throttler: AsyncThrottler<TFn>) => boolean)
  /**
   * Whether to execute the function immediately when called
   * Defaults to true
   */
  leading?: boolean
  /**
   * Optional error handler for when the throttled function throws.
   * If provided, the handler will be called with the error and throttler instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
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
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Whether to execute the function on the trailing edge of the wait period
   * Defaults to true
   */
  trailing?: boolean
  /**
   * Time window in milliseconds during which the function can only be executed once.
   * Can be a number or a function that returns a number.
   * Defaults to 0ms
   */
  wait: number | ((throttler: AsyncThrottler<TFn>) => number)
}

type AsyncThrottlerOptionsWithOptionalCallbacks = OptionalKeys<
  AsyncThrottlerOptions<any>,
  'onError' | 'onSettled' | 'onSuccess'
>

const defaultOptions: AsyncThrottlerOptionsWithOptionalCallbacks = {
  enabled: true,
  leading: true,
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
 * Unlike the non-async Throttler, this async version supports returning values from the throttled function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the throttled function.
 *
 * This is useful for rate-limiting API calls, handling scroll/resize events, or any scenario where you want to
 * ensure a maximum execution frequency.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and throttler instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncThrottler instance
 *
 * @example
 * ```ts
 * const throttler = new AsyncThrottler(async (value: string) => {
 *   const result = await saveToAPI(value);
 *   return result; // Return value is preserved
 * }, {
 *   wait: 1000,
 *   onError: (error) => {
 *     console.error('API call failed:', error);
 *   }
 * });
 *
 * // Will only execute once per second no matter how often called
 * // Returns the API response directly
 * const result = await throttler.maybeExecute(inputElement.value);
 * ```
 */
export class AsyncThrottler<TFn extends AnyAsyncFunction> {
  private _options: AsyncThrottlerOptionsWithOptionalCallbacks
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
  private _resolvePreviousPromise:
    | ((value?: ReturnType<TFn> | undefined) => void)
    | null = null

  constructor(
    private fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn>,
  ) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
  }

  /**
   * Updates the throttler options
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
  getOptions(): AsyncThrottlerOptions<TFn> {
    return this._options
  }

  /**
   * Returns the current enabled state of the throttler
   */
  getEnabled(): boolean {
    return !!parseFunctionOrValue(this._options.enabled, this)
  }

  /**
   * Returns the current wait time in milliseconds
   */
  getWait(): number {
    return parseFunctionOrValue(this._options.wait, this)
  }

  /**
   * Attempts to execute the throttled function.
   * If a call is already in progress, it may be blocked or queued depending on the `wait` option.
   *
   * Error Handling:
   * - If the throttled function throws and no `onError` handler is configured,
   *   the error will be thrown from this method.
   * - If an `onError` handler is configured, errors will be caught and passed to the handler,
   *   and this method will return undefined.
   * - The error state can be checked using `getErrorCount()` and `getIsExecuting()`.
   *
   * @returns A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError
   * @throws The error from the throttled function if no onError handler is configured
   */
  async maybeExecute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    const now = Date.now()
    const timeSinceLastExecution = now - this._lastExecutionTime
    const wait = this.getWait()

    this.resolvePreviousPromise()

    // Handle leading execution
    if (this._options.leading && timeSinceLastExecution >= wait) {
      await this.execute(...args)
      return this._lastResult
    } else {
      // Store the most recent arguments for potential trailing execution
      this._lastArgs = args

      return new Promise((resolve) => {
        this._resolvePreviousPromise = resolve
        // Clear any existing timeout to ensure we use the latest arguments
        if (this._timeoutId) {
          clearTimeout(this._timeoutId)
        }

        // Set up trailing execution if enabled
        if (this._options.trailing) {
          const _timeSinceLastExecution = this._lastExecutionTime
            ? now - this._lastExecutionTime
            : 0
          const timeoutDuration = wait - _timeSinceLastExecution
          this._timeoutId = setTimeout(async () => {
            if (this._lastArgs !== undefined) {
              await this.execute(...this._lastArgs)
            }
            this._resolvePreviousPromise = null
            resolve(this._lastResult)
          }, timeoutDuration)
        }
      })
    }
  }

  private async execute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this.getEnabled() || this._isExecuting) return undefined
    this._abortController = new AbortController()
    try {
      this._isExecuting = true
      this._lastResult = await this.fn(...args) // EXECUTE!
      this._successCount++
      this._options.onSuccess?.(this._lastResult!, this)
    } catch (error) {
      this._errorCount++
      this._options.onError?.(error, this)
      if (this._options.throwOnError) {
        throw error
      } else {
        console.error(error)
      }
    } finally {
      this._isExecuting = false
      this._settleCount++
      this._abortController = null
      this._lastExecutionTime = Date.now()
      this._nextExecutionTime = this._lastExecutionTime + this.getWait()
      this._options.onSettled?.(this)
    }
    return this._lastResult
  }

  private resolvePreviousPromise(): void {
    if (this._resolvePreviousPromise) {
      this._resolvePreviousPromise(this._lastResult)
      this._resolvePreviousPromise = null
    }
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
    this.resolvePreviousPromise()
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
    return this.getEnabled() && !!this._timeoutId
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
 * Unlike the non-async Throttler, this async version supports returning values from the throttled function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the throttled function.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and throttler instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncThrottler instance
 *
 * @example
 * ```ts
 * const throttled = asyncThrottle(async (value: string) => {
 *   const result = await saveToAPI(value);
 *   return result; // Return value is preserved
 * }, {
 *   wait: 1000,
 *   onError: (error) => {
 *     console.error('API call failed:', error);
 *   }
 * });
 *
 * // This will execute at most once per second
 * // Returns the API response directly
 * const result = await throttled(inputElement.value);
 * ```
 */
export function asyncThrottle<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncThrottlerOptions<TFn>,
) {
  const asyncThrottler = new AsyncThrottler(fn, initialOptions)
  return asyncThrottler.maybeExecute.bind(asyncThrottler)
}
