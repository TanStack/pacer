import { Store } from '@tanstack/store'
import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction, OptionalKeys } from './types'

export interface AsyncThrottlerState<TFn extends AnyAsyncFunction> {
  errorCount: number
  isExecuting: boolean
  isPending: boolean
  lastArgs: Parameters<TFn> | undefined
  lastExecutionTime: number
  lastResult: ReturnType<TFn> | undefined
  nextExecutionTime: number
  settleCount: number
  status: 'idle' | 'pending' | 'executing' | 'settled'
  successCount: number
}

function getDefaultAsyncThrottlerState<
  TFn extends AnyAsyncFunction,
>(): AsyncThrottlerState<TFn> {
  return structuredClone({
    errorCount: 0,
    isExecuting: false,
    isPending: false,
    lastArgs: undefined,
    lastExecutionTime: 0,
    lastResult: undefined,
    nextExecutionTime: 0,
    settleCount: 0,
    status: 'idle',
    successCount: 0,
  })
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
  'initialState' | 'onError' | 'onSettled' | 'onSuccess'
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
  readonly store: Store<AsyncThrottlerState<TFn>> = new Store<
    AsyncThrottlerState<TFn>
  >(getDefaultAsyncThrottlerState<TFn>())
  #options: AsyncThrottlerOptions<TFn>
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
    this.#setState(this.#options.initialState ?? {})
  }

  /**
   * Updates the async throttler options
   */
  setOptions = (newOptions: Partial<AsyncThrottlerOptions<TFn>>): void => {
    this.#options = { ...this.#options, ...newOptions }

    // End the pending state if the throttler is disabled
    if (!this.#getEnabled()) {
      this.cancel()
    }
  }

  #setState = (newState: Partial<AsyncThrottlerState<TFn>>): void => {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }
      const { isPending, isExecuting, settleCount } = combinedState
      return {
        ...combinedState,
        status: isPending
          ? 'pending'
          : isExecuting
            ? 'executing'
            : settleCount > 0
              ? 'settled'
              : 'idle',
      }
    })
  }

  /**
   * Returns the current enabled state of the async throttler
   */
  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.#options.enabled, this)
  }

  /**
   * Returns the current wait time in milliseconds
   */
  #getWait = (): number => {
    return parseFunctionOrValue(this.#options.wait, this)
  }

  /**
   * Attempts to execute the throttled function. The execution behavior depends on the throttler options:
   *
   * - If enough time has passed since the last execution (>= wait period):
   *   - With leading=true: Executes immediately
   *   - With leading=false: Waits for the next trailing execution
   *
   * - If within the wait period:
   *   - With trailing=true: Schedules execution for end of wait period
   *   - With trailing=false: Drops the execution
   *
   * @example
   * ```ts
   * const throttled = new AsyncThrottler(fn, { wait: 1000 });
   *
   * // First call executes immediately
   * await throttled.maybeExecute('a', 'b');
   *
   * // Call during wait period - gets throttled
   * await throttled.maybeExecute('c', 'd');
   * ```
   */
  maybeExecute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled()) return undefined
    const now = Date.now()
    const timeSinceLastExecution = now - this.store.state.lastExecutionTime
    const wait = this.#getWait()

    this.#resolvePreviousPromiseInternal()

    // Handle leading execution
    if (this.#options.leading && timeSinceLastExecution >= wait) {
      await this.#execute(...args)
      return this.store.state.lastResult
    } else {
      // Store the most recent arguments for potential trailing execution
      this.#setState({ lastArgs: args })

      return new Promise((resolve) => {
        this.#resolvePreviousPromise = resolve
        // Clear any existing timeout to ensure we use the latest arguments
        this.#clearTimeout()

        // Set up trailing execution if enabled
        if (this.#options.trailing) {
          const _timeSinceLastExecution = this.store.state.lastExecutionTime
            ? now - this.store.state.lastExecutionTime
            : 0
          const timeoutDuration = wait - _timeSinceLastExecution
          this.#setState({ isPending: true })
          this.#timeoutId = setTimeout(async () => {
            if (this.store.state.lastArgs !== undefined) {
              await this.#execute(...this.store.state.lastArgs)
            }
            this.#resolvePreviousPromise = null
            resolve(this.store.state.lastResult)
          }, timeoutDuration)
        }
      })
    }
  }

  #execute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled() || this.store.state.isExecuting) return undefined
    this.#abortController = new AbortController()
    try {
      this.#setState({ isExecuting: true })
      const result = await this.fn(...args) // EXECUTE!
      this.#setState({
        lastResult: result,
        successCount: this.store.state.successCount + 1,
      })
      this.#options.onSuccess?.(result, this)
    } catch (error) {
      this.#setState({
        errorCount: this.store.state.errorCount + 1,
      })
      this.#options.onError?.(error, this)
      if (this.#options.throwOnError) {
        throw error
      } else {
        console.error(error)
      }
    } finally {
      const lastExecutionTime = Date.now()
      const nextExecutionTime = lastExecutionTime + this.#getWait()
      this.#setState({
        isExecuting: false,
        isPending: false,
        settleCount: this.store.state.settleCount + 1,
        lastExecutionTime,
        nextExecutionTime,
      })
      this.#abortController = null
      this.#options.onSettled?.(this)
    }
    return this.store.state.lastResult
  }

  /**
   * Processes the current pending execution immediately
   */
  flush = (): void => {
    if (this.store.state.isPending && this.store.state.lastArgs) {
      this.#abortExecution() // abort any current execution
      this.#clearTimeout() // clear any existing timeout
      this.#execute(...this.store.state.lastArgs)
    }
  }

  #resolvePreviousPromiseInternal = (): void => {
    if (this.#resolvePreviousPromise) {
      this.#resolvePreviousPromise(this.store.state.lastResult)
      this.#resolvePreviousPromise = null
    }
  }

  #clearTimeout = (): void => {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
  }

  #cancelPendingExecution = (): void => {
    this.#clearTimeout()
    if (this.#resolvePreviousPromise) {
      this.#resolvePreviousPromise(this.store.state.lastResult)
      this.#resolvePreviousPromise = null
    }
    this.#setState({
      isPending: false,
      isExecuting: false,
      lastArgs: undefined,
    })
  }

  #abortExecution = (): void => {
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
    }
  }

  /**
   * Cancels any pending execution or aborts any execution in progress
   */
  cancel = (): void => {
    this.#cancelPendingExecution()
    this.#abortExecution()
  }

  /**
   * Resets the debouncer state to its default values
   */
  reset = (): void => {
    this.#setState(getDefaultAsyncThrottlerState<TFn>())
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
  return asyncThrottler.maybeExecute
}
