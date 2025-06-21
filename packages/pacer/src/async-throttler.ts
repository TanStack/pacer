import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction, OptionalKeys } from './types'

export interface AsyncThrottlerState<TFn extends AnyAsyncFunction> {
  errorCount: number
  isExecuting: boolean
  lastArgs: Parameters<TFn> | undefined
  lastExecutionTime: number
  lastResult: ReturnType<TFn> | undefined
  nextExecutionTime: number
  settleCount: number
  successCount: number
}

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
   * Initial state for the async throttler
   */
  initialState?: Partial<AsyncThrottlerState<TFn>>
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
   * Callback function that is called when the state of the async throttler is updated
   */
  onStateChange?: (
    state: AsyncThrottlerState<TFn>,
    throttler: AsyncThrottler<TFn>,
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
  'initialState' | 'onError' | 'onSettled' | 'onSuccess' | 'onStateChange'
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async throttler
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes error count, execution status, last execution time, and success/settle counts
 * - State can be retrieved using `getState()` method
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
  #options: AsyncThrottlerOptions<TFn>
  #state: AsyncThrottlerState<TFn> = {
    errorCount: 0,
    isExecuting: false,
    lastArgs: undefined,
    lastExecutionTime: 0,
    lastResult: undefined,
    nextExecutionTime: 0,
    settleCount: 0,
    successCount: 0,
  }
  #abortController: AbortController | null = null
  #timeoutId: NodeJS.Timeout | null = null
  #resolvePreviousPromise:
    | ((value?: ReturnType<TFn> | undefined) => void)
    | null = null

  constructor(
    private fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#state = {
      ...this.#state,
      ...this.#options.initialState,
    }
  }

  /**
   * Updates the throttler options
   */
  setOptions(newOptions: Partial<AsyncThrottlerOptions<TFn>>): void {
    this.#options = { ...this.#options, ...newOptions }

    // End the pending state if the throttler is disabled
    if (!this.getEnabled()) {
      this.cancel()
    }
  }

  /**
   * Returns the current options
   */
  getOptions(): AsyncThrottlerOptions<TFn> {
    return this.#options
  }

  /**
   * Returns the current state for persistence
   */
  getState(): AsyncThrottlerState<TFn> {
    return { ...this.#state }
  }

  /**
   * Loads state from a persisted object or updates state with a partial
   */
  #setState(state: Partial<AsyncThrottlerState<TFn>>): void {
    this.#state = { ...this.#state, ...state }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Returns the current enabled state of the throttler
   */
  getEnabled(): boolean {
    return !!parseFunctionOrValue(this.#options.enabled, this)
  }

  /**
   * Returns the current wait time in milliseconds
   */
  getWait(): number {
    return parseFunctionOrValue(this.#options.wait, this)
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
    const timeSinceLastExecution = now - this.#state.lastExecutionTime
    const wait = this.getWait()

    this.#resolvePreviousPromiseInternal()

    // Handle leading execution
    if (this.#options.leading && timeSinceLastExecution >= wait) {
      await this.#execute(...args)
      return this.#state.lastResult
    } else {
      // Store the most recent arguments for potential trailing execution
      this.#state.lastArgs = args

      return new Promise((resolve) => {
        this.#resolvePreviousPromise = resolve
        // Clear any existing timeout to ensure we use the latest arguments
        if (this.#timeoutId) {
          clearTimeout(this.#timeoutId)
        }

        // Set up trailing execution if enabled
        if (this.#options.trailing) {
          const _timeSinceLastExecution = this.#state.lastExecutionTime
            ? now - this.#state.lastExecutionTime
            : 0
          const timeoutDuration = wait - _timeSinceLastExecution
          this.#timeoutId = setTimeout(async () => {
            if (this.#state.lastArgs !== undefined) {
              await this.#execute(...this.#state.lastArgs)
            }
            this.#resolvePreviousPromise = null
            resolve(this.#state.lastResult)
          }, timeoutDuration)
        }
      })
    }
  }

  async #execute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this.getEnabled() || this.#state.isExecuting) return undefined
    this.#abortController = new AbortController()
    try {
      this.#setState({ isExecuting: true })
      this.#state.lastResult = await this.fn(...args) // EXECUTE!
      this.#setState({
        successCount: this.#state.successCount + 1,
      })
      this.#options.onSuccess?.(this.#state.lastResult!, this)
    } catch (error) {
      this.#setState({
        errorCount: this.#state.errorCount + 1,
      })
      this.#options.onError?.(error, this)
      if (this.#options.throwOnError) {
        throw error
      } else {
        console.error(error)
      }
    } finally {
      this.#setState({
        isExecuting: false,
        settleCount: this.#state.settleCount + 1,
        lastExecutionTime: Date.now(),
      })
      this.#state.nextExecutionTime =
        this.#state.lastExecutionTime + this.getWait()
      this.#abortController = null
      this.#options.onSettled?.(this)
    }
    return this.#state.lastResult
  }

  #resolvePreviousPromiseInternal(): void {
    if (this.#resolvePreviousPromise) {
      this.#resolvePreviousPromise(this.#state.lastResult)
      this.#resolvePreviousPromise = null
    }
  }

  /**
   * Cancels any pending execution or aborts any execution in progress
   */
  cancel(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
    }
    this.#resolvePreviousPromiseInternal()
    this.#state.lastArgs = undefined
  }

  /**
   * Returns the last execution time
   */
  getLastExecutionTime(): number {
    return this.#state.lastExecutionTime
  }

  /**
   * Returns the next execution time
   */
  getNextExecutionTime(): number {
    return this.#state.nextExecutionTime
  }

  /**
   * Returns the last result of the throttled function
   */
  getLastResult(): ReturnType<TFn> | undefined {
    return this.#state.lastResult
  }

  /**
   * Returns the number of times the function has been executed successfully
   */
  getSuccessCount(): number {
    return this.#state.successCount
  }

  /**
   * Returns the number of times the function has settled (completed or errored)
   */
  getSettleCount(): number {
    return this.#state.settleCount
  }

  /**
   * Returns the number of times the function has errored
   */
  getErrorCount(): number {
    return this.#state.errorCount
  }

  /**
   * Returns the current pending state
   */
  getIsPending(): boolean {
    return this.getEnabled() && !!this.#timeoutId
  }

  /**
   * Returns the current executing state
   */
  getIsExecuting(): boolean {
    return this.#state.isExecuting
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async throttler
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes error count, execution status, last execution time, and success/settle counts
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
