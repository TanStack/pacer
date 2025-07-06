import { Store } from '@tanstack/store'
import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction, OptionalKeys } from './types'

export interface AsyncDebouncerState<TFn extends AnyAsyncFunction> {
  canLeadingExecute: boolean
  errorCount: number
  isExecuting: boolean
  isPending: boolean
  lastArgs: Parameters<TFn> | undefined
  lastResult: ReturnType<TFn> | undefined
  settleCount: number
  status: 'idle' | 'pending' | 'executing' | 'settled'
  successCount: number
}

function getDefaultAsyncDebouncerState<
  TFn extends AnyAsyncFunction,
>(): AsyncDebouncerState<TFn> {
  return structuredClone({
    canLeadingExecute: true,
    errorCount: 0,
    isExecuting: false,
    isPending: false,
    lastArgs: undefined,
    lastResult: undefined,
    settleCount: 0,
    successCount: 0,
    status: 'idle',
  })
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
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Optional error handler for when the debounced function throws.
   * If provided, the handler will be called with the error and debouncer instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
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
  'initialState' | 'onError' | 'onSettled' | 'onSuccess'
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
  readonly store: Store<AsyncDebouncerState<TFn>> = new Store<
    AsyncDebouncerState<TFn>
  >(getDefaultAsyncDebouncerState<TFn>())
  #options: AsyncDebouncerOptions<TFn>
  #abortController: AbortController | null = null
  #timeoutId: NodeJS.Timeout | null = null
  #resolvePreviousPromise:
    | ((value?: ReturnType<TFn> | undefined) => void)
    | null = null

  constructor(
    private fn: TFn,
    initialOptions: AsyncDebouncerOptions<TFn>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.#options.initialState ?? {})
  }

  /**
   * Updates the async debouncer options
   */
  setOptions = (newOptions: Partial<AsyncDebouncerOptions<TFn>>): void => {
    this.#options = { ...this.#options, ...newOptions }

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
   * Returns the current debouncer enabled state
   */
  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.#options.enabled, this)
  }

  /**
   * Returns the current debouncer wait state
   */
  #getWait = (): number => {
    return parseFunctionOrValue(this.#options.wait, this)
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
    this.#setState({ lastArgs: args })

    // Handle leading execution
    if (this.#options.leading && this.store.state.canLeadingExecute) {
      this.#setState({ canLeadingExecute: false })
      await this.#execute(...args)
      return this.store.state.lastResult
    }

    // Handle trailing execution
    if (this.#options.trailing && this.#getEnabled()) {
      this.#setState({ isPending: true })
    }

    return new Promise((resolve) => {
      this.#resolvePreviousPromise = resolve
      this.#timeoutId = setTimeout(async () => {
        // Execute trailing if enabled
        if (this.#options.trailing && this.store.state.lastArgs) {
          await this.#execute(...this.store.state.lastArgs)
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
      this.#options.onSuccess?.(result, this)
    } catch (error) {
      this.#setState({
        errorCount: this.store.state.errorCount + 1,
      })
      this.#options.onError?.(error, this)
      if (this.#options.throwOnError) {
        throw error
      }
    } finally {
      this.#setState({
        isExecuting: false,
        isPending: false,
        settleCount: this.store.state.settleCount + 1,
      })
      this.#abortController = null
      this.#options.onSettled?.(this)
    }
    return this.store.state.lastResult
  }

  #cancelPendingExecution = (): void => {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
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

  /**
   * Cancels any pending execution or aborts any execution in progress
   */
  cancel = (): void => {
    this.#cancelPendingExecution()
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
    }
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
 * - Use `initialState` to provide initial state values when creating the async debouncer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes canLeadingExecute, error count, execution status, and success/settle counts
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
