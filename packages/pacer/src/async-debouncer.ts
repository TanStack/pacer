import { Store } from '@tanstack/store'
import { createKey, parseFunctionOrValue } from './utils'
import { emitChange, pacerEventClient } from './event-client'
import type { AnyAsyncFunction, OptionalKeys } from './types'

export interface AsyncDebouncerState<TFn extends AnyAsyncFunction> {
  /**
   * Whether the debouncer can execute on the leading edge of the timeout
   */
  canLeadingExecute: boolean
  /**
   * Number of function executions that have resulted in errors
   */
  errorCount: number
  /**
   * Whether the debounced function is currently executing asynchronously
   */
  isExecuting: boolean
  /**
   * Whether the debouncer is waiting for the timeout to trigger execution
   */
  isPending: boolean
  /**
   * The arguments from the most recent call to maybeExecute
   */
  lastArgs: Parameters<TFn> | undefined
  /**
   * The result from the most recent successful function execution
   */
  lastResult: ReturnType<TFn> | undefined
  /**
   * Number of times maybeExecute has been called (for reduction calculations)
   */
  maybeExecuteCount: number
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

function getDefaultAsyncDebouncerState<
  TFn extends AnyAsyncFunction,
>(): AsyncDebouncerState<TFn> {
  return {
    canLeadingExecute: true,
    errorCount: 0,
    isExecuting: false,
    isPending: false,
    lastArgs: undefined,
    lastResult: undefined,
    maybeExecuteCount: 0,
    settleCount: 0,
    status: 'idle',
    successCount: 0,
  }
}

/**
 * Options for configuring an async debounced function
 */
export interface AsyncDebouncerOptions<TFn extends AnyAsyncFunction> {
  /**
   * Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
   * Can be a boolean or a function that returns a boolean.
   * Defaults to true.
   */
  enabled?: boolean | ((debouncer: AsyncDebouncer<TFn>) => boolean)
  /**
   * Initial state for the async debouncer
   */
  initialState?: Partial<AsyncDebouncerState<TFn>>
  /**
   * Optional key to identify this async debouncer instance.
   * If provided, the async debouncer will be identified by this key in the devtools and PacerProvider if applicable.
   */
  key?: string
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Optional error handler for when the debounced function throws.
   * If provided, the handler will be called with the error and debouncer instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (
    error: unknown,
    args: Parameters<TFn>,
    debouncer: AsyncDebouncer<TFn>,
  ) => void
  /**
   * Optional callback to call when the debounced function is executed
   */
  onSettled?: (args: Parameters<TFn>, debouncer: AsyncDebouncer<TFn>) => void
  /**
   * Optional callback to call when the debounced function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    args: Parameters<TFn>,
    debouncer: AsyncDebouncer<TFn>,
  ) => void
  /**
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true.
   */
  trailing?: boolean
  /**
   * Delay in milliseconds to wait after the last call before executing.
   * Can be a number or a function that returns a number.
   * Defaults to 0ms
   */
  wait: number | ((debouncer: AsyncDebouncer<TFn>) => number)
}

type AsyncDebouncerOptionsWithOptionalCallbacks = OptionalKeys<
  AsyncDebouncerOptions<any>,
  'initialState' | 'onError' | 'onSettled' | 'onSuccess' | 'key'
>

const defaultOptions: AsyncDebouncerOptionsWithOptionalCallbacks = {
  enabled: true,
  leading: false,
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
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and debouncer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying store
 *
 * State Management:
 * - The debouncer uses a reactive store for state management
 * - Use `initialState` to provide initial state values when creating the async debouncer
 * - The state includes canLeadingExecute, error count, execution status, and success/settle counts
 * - State can be accessed via the `store` property and its `state` getter
 * - The store is reactive and will notify subscribers of state changes
 *
 * @example
 * ```ts
 * const asyncDebouncer = new AsyncDebouncer(async (value: string) => {
 *   const results = await searchAPI(value);
 *   return results; // Return value is preserved
 * }, {
 *   wait: 500,
 *   onError: (error) => {
 *     console.error('Search failed:', error);
 *   }
 * });
 *
 * // Called on each keystroke but only executes after 500ms of no typing
 * // Returns the API response directly
 * const results = await asyncDebouncer.maybeExecute(inputElement.value);
 * ```
 */
export class AsyncDebouncer<TFn extends AnyAsyncFunction> {
  readonly store: Store<Readonly<AsyncDebouncerState<TFn>>> = new Store<
    AsyncDebouncerState<TFn>
  >(getDefaultAsyncDebouncerState<TFn>())
  key: string
  options: AsyncDebouncerOptions<TFn>
  #abortController: AbortController | null = null
  #timeoutId: NodeJS.Timeout | null = null
  #resolvePreviousPromise:
    | ((value?: ReturnType<TFn> | undefined) => void)
    | null = null

  constructor(
    public fn: TFn,
    initialOptions: AsyncDebouncerOptions<TFn>,
  ) {
    this.key = createKey(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.options.initialState ?? {})

    pacerEventClient.on('d-AsyncDebouncer', (event) => {
      if (event.payload.key !== this.key) return
      this.#setState(event.payload.store.state as AsyncDebouncerState<TFn>)
      this.setOptions(event.payload.options)
    })
  }

  /**
   * Updates the async debouncer options
   */
  setOptions = (newOptions: Partial<AsyncDebouncerOptions<TFn>>): void => {
    this.options = { ...this.options, ...newOptions }

    // Cancel pending execution if the debouncer is disabled
    if (!this.#getEnabled()) {
      this.cancel()
    }
  }

  #setState = (newState: Partial<AsyncDebouncerState<TFn>>): void => {
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
    emitChange('AsyncDebouncer', this)
  }

  /**
   * Returns the current debouncer enabled state
   */
  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.options.enabled, this)
  }

  /**
   * Returns the current debouncer wait state
   */
  #getWait = (): number => {
    return parseFunctionOrValue(this.options.wait, this)
  }

  /**
   * Attempts to execute the debounced function.
   * If a call is already in progress, it will be queued.
   *
   * Error Handling:
   * - If the debounced function throws and no `onError` handler is configured,
   *   the error will be thrown from this method.
   * - If an `onError` handler is configured, errors will be caught and passed to the handler,
   *   and this method will return undefined.
   * - The error state can be checked using `getErrorCount()` and `getIsExecuting()`.
   *
   * @returns A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError
   * @throws The error from the debounced function if no onError handler is configured
   */
  maybeExecute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled()) return undefined
    this.#cancelPendingExecution()
    this.#setState({
      lastArgs: args,
      maybeExecuteCount: this.store.state.maybeExecuteCount + 1,
    })

    // Handle leading execution
    if (this.options.leading && this.store.state.canLeadingExecute) {
      this.#setState({ canLeadingExecute: false })
      await this.#execute(...args)
      return this.store.state.lastResult
    }

    // Handle trailing execution
    if (this.options.trailing && this.#getEnabled()) {
      this.#setState({ isPending: true })
    }

    return new Promise((resolve, reject) => {
      this.#resolvePreviousPromise = resolve
      // this.#rejectPreviousPromise = reject
      this.#timeoutId = setTimeout(async () => {
        // Execute trailing if enabled
        if (this.options.trailing && this.store.state.lastArgs) {
          try {
            await this.#execute(...this.store.state.lastArgs)
          } catch (error) {
            reject(error)
          }
        }

        // Reset state and resolve
        this.#setState({ canLeadingExecute: true })
        this.#resolvePreviousPromise = null
        resolve(this.store.state.lastResult)
      }, this.#getWait())
    })
  }

  #execute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled()) return undefined
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
      this.#setState({
        isExecuting: false,
        isPending: false,
        lastArgs: undefined,
        settleCount: this.store.state.settleCount + 1,
      })
      this.#abortController = null
      this.options.onSettled?.(args, this)
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
    this.#resolvePreviousPromiseInternal()
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
    this.#setState({ canLeadingExecute: true })
  }

  /**
   * Resets the debouncer state to its default values
   */
  reset = (): void => {
    this.#setState(getDefaultAsyncDebouncerState<TFn>())
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
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and debouncer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - The error state can be checked using the underlying AsyncDebouncer instance
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the async debouncer
 * - Use `onSuccess` callback to react to successful function execution and implement custom logic
 * - Use `onError` callback to react to function execution errors and implement custom error handling
 * - Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
 * - The state includes canLeadingExecute, error count, execution status, and success/settle counts
 * - State can be accessed via `asyncDebouncer.store.state` when using the class directly
 * - When using framework adapters (React/Solid), state is accessed from `asyncDebouncer.state`
 *
 * @example
 * ```ts
 * const debounced = asyncDebounce(async (value: string) => {
 *   const result = await saveToAPI(value);
 *   return result; // Return value is preserved
 * }, {
 *   wait: 1000,
 *   onError: (error) => {
 *     console.error('API call failed:', error);
 *   },
 *   throwOnError: true // Will both log the error and throw it
 * });
 *
 * // Will only execute once, 1 second after the last call
 * // Returns the API response directly
 * const result = await debounced("third");
 * ```
 */
export function asyncDebounce<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncDebouncerOptions<TFn>,
) {
  const asyncDebouncer = new AsyncDebouncer(fn, initialOptions)
  return asyncDebouncer.maybeExecute
}
