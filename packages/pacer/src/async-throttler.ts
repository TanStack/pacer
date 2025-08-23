import { Store } from '@tanstack/store'
import { createKey, parseFunctionOrValue } from './utils'
import { emitChange, pacerEventClient } from './event-client'
import type { AnyAsyncFunction, OptionalKeys } from './types'

export interface AsyncThrottlerState<TFn extends AnyAsyncFunction> {
  /**
   * Number of function executions that have resulted in errors
   */
  errorCount: number
  /**
   * Whether the throttled function is currently executing asynchronously
   */
  isExecuting: boolean
  /**
   * Whether the throttler is waiting for the timeout to trigger execution
   */
  isPending: boolean
  /**
   * The arguments from the most recent call to maybeExecute
   */
  lastArgs: Parameters<TFn> | undefined
  /**
   * Timestamp of the last function execution in milliseconds
   */
  lastExecutionTime: number
  /**
   * The result from the most recent successful function execution
   */
  lastResult: ReturnType<TFn> | undefined
  /**
   * Number of times maybeExecute has been called (for reduction calculations)
   */
  maybeExecuteCount: number
  /**
   * Timestamp when the next execution can occur in milliseconds
   */
  nextExecutionTime: number | undefined
  /**
   * Number of function executions that have completed (either successfully or with errors)
   */
  settleCount: number
  /**
   * Current execution status - 'idle' when not active, 'pending' when waiting, 'executing' when running, 'settled' when completed
   */
  status: 'disabled' | 'idle' | 'pending' | 'executing' | 'settled'
  /**
   * Number of function executions that have completed successfully
   */
  successCount: number
}

function getDefaultAsyncThrottlerState<
  TFn extends AnyAsyncFunction,
>(): AsyncThrottlerState<TFn> {
  return {
    errorCount: 0,
    isExecuting: false,
    isPending: false,
    lastArgs: undefined,
    lastExecutionTime: 0,
    lastResult: undefined,
    maybeExecuteCount: 0,
    nextExecutionTime: undefined,
    settleCount: 0,
    status: 'idle',
    successCount: 0,
  }
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
   * Optional key to identify this async throttler instance.
   * If provided, the async throttler will be identified by this key in the devtools and PacerProvider if applicable.
   */
  key?: string
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
  onError?: (
    error: unknown,
    args: Parameters<TFn>,
    asyncThrottler: AsyncThrottler<TFn>,
  ) => void
  /**
   * Optional function to call when the throttled function is executed
   */
  onSettled?: (
    args: Parameters<TFn>,
    asyncThrottler: AsyncThrottler<TFn>,
  ) => void
  /**
   * Optional function to call when the throttled function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    args: Parameters<TFn>,
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
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the async throttler
 * - Use `onSuccess` callback to react to successful function execution and implement custom logic
 * - Use `onError` callback to react to function execution errors and implement custom error handling
 * - Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
 * - The state includes error count, execution status, last execution time, and success/settle counts
 * - State can be accessed via `asyncThrottler.store.state` when using the class directly
 * - When using framework adapters (React/Solid), state is accessed from `asyncThrottler.state`
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
  readonly store: Store<Readonly<AsyncThrottlerState<TFn>>> = new Store<
    AsyncThrottlerState<TFn>
  >(getDefaultAsyncThrottlerState<TFn>())
  key: string
  options: AsyncThrottlerOptions<TFn>
  #abortController: AbortController | null = null
  #timeoutId: NodeJS.Timeout | null = null
  #resolvePreviousPromise:
    | ((value?: ReturnType<TFn> | undefined) => void)
    | null = null

  constructor(
    public fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn>,
  ) {
    this.key = createKey(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.options.initialState ?? {})
    pacerEventClient.on('d-AsyncThrottler', (event) => {
      if (event.payload.key !== this.key) return
      this.#setState(event.payload.store.state as AsyncThrottlerState<TFn>)
      this.setOptions(event.payload.options)
    })
  }

  /**
   * Updates the async throttler options
   */
  setOptions = (newOptions: Partial<AsyncThrottlerOptions<TFn>>): void => {
    this.options = { ...this.options, ...newOptions }

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
        status: !this.#getEnabled()
          ? 'disabled'
          : isPending
            ? 'pending'
            : isExecuting
              ? 'executing'
              : settleCount > 0
                ? 'settled'
                : 'idle',
      }
    })
    emitChange('AsyncThrottler', this)
  }

  /**
   * Returns the current enabled state of the async throttler
   */
  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.options.enabled, this)
  }

  /**
   * Returns the current wait time in milliseconds
   */
  #getWait = (): number => {
    return parseFunctionOrValue(this.options.wait, this)
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
    // Store the most recent arguments for potential trailing execution
    this.#setState({
      lastArgs: args,
      maybeExecuteCount: this.store.state.maybeExecuteCount + 1,
    })

    this.#resolvePreviousPromiseInternal()

    // Handle leading execution
    if (this.options.leading && timeSinceLastExecution >= wait) {
      await this.#execute(...args)
      return this.store.state.lastResult
    } else {
      return new Promise((resolve, reject) => {
        this.#resolvePreviousPromise = resolve
        // Clear any existing timeout to ensure we use the latest arguments
        this.#clearTimeout()

        // Set up trailing execution if enabled
        if (this.options.trailing) {
          const _timeSinceLastExecution = this.store.state.lastExecutionTime
            ? now - this.store.state.lastExecutionTime
            : 0
          const timeoutDuration = wait - _timeSinceLastExecution
          this.#setState({ isPending: true })
          this.#timeoutId = setTimeout(async () => {
            if (this.store.state.lastArgs !== undefined) {
              try {
                await this.#execute(...this.store.state.lastArgs) // EXECUTE!
              } catch (error) {
                reject(error)
              }
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
      this.options.onSuccess?.(result, args, this)
    } catch (error) {
      this.#setState({
        errorCount: this.store.state.errorCount + 1,
      })
      this.options.onError?.(error, args, this)
      if (this.options.throwOnError) {
        throw error
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
      this.options.onSettled?.(args, this)
      setTimeout(() => {
        if (!this.store.state.isPending) {
          this.#setState({ nextExecutionTime: undefined })
        }
      }, this.#getWait())
    }
    return this.store.state.lastResult
  }

  /**
   * Processes the current pending execution immediately
   */
  flush = async (): Promise<ReturnType<TFn> | undefined> => {
    if (this.store.state.isPending && this.store.state.lastArgs) {
      this.#abortExecution() // abort any current execution
      this.#clearTimeout() // clear any existing timeout
      const result = await this.#execute(...this.store.state.lastArgs)

      // Resolve any pending promise from maybeExecute
      this.#resolvePreviousPromiseInternal()

      return result
    }
    return undefined
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
      this.#resolvePreviousPromiseInternal()
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
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the async throttler
 * - Use `onSuccess` callback to react to successful function execution and implement custom logic
 * - Use `onError` callback to react to function execution errors and implement custom error handling
 * - Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
 * - The state includes error count, execution status, last execution time, and success/settle counts
 * - State can be accessed via the underlying AsyncThrottler instance's `store.state` property
 * - When using framework adapters (React/Solid), state is accessed from the hook's state property
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
