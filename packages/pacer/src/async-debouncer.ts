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
  successCount: number
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
   * Callback function that is called when the state of the async debouncer is updated
   */
  onStateChange?: (
    state: AsyncDebouncerState<TFn>,
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
  'initialState' | 'onError' | 'onSettled' | 'onSuccess' | 'onStateChange'
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
 * - If an error occurs during execution and no `onError` handler is provided, the error will be thrown and propagate up to the caller.
 * - If an `onError` handler is provided, errors will be caught and passed to the handler instead of being thrown.
 * - The error count can be tracked using `getErrorCount()`.
 * - The debouncer maintains its state and can continue to be used after an error occurs.
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async debouncer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes canLeadingExecute, error count, execution status, and success/settle counts
 * - State can be retrieved using `getState()` method
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
  #options: AsyncDebouncerOptions<TFn>
  #state: AsyncDebouncerState<TFn> = {
    canLeadingExecute: true,
    errorCount: 0,
    isExecuting: false,
    isPending: false,
    lastArgs: undefined,
    lastResult: undefined,
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
    initialOptions: AsyncDebouncerOptions<TFn>,
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
   * Updates the debouncer options
   */
  setOptions(newOptions: Partial<AsyncDebouncerOptions<TFn>>): void {
    this.#options = { ...this.#options, ...newOptions }

    // End the pending state if the debouncer is disabled
    if (!this.getEnabled()) {
      this.#setState({ isPending: false })
    }
  }

  /**
   * Returns the current debouncer options
   */
  getOptions(): AsyncDebouncerOptions<TFn> {
    return this.#options
  }

  getState(): AsyncDebouncerState<TFn> {
    return { ...this.#state }
  }

  #setState(newState: Partial<AsyncDebouncerState<TFn>>): void {
    this.#state = { ...this.#state, ...newState }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Returns the current debouncer enabled state
   */
  getEnabled(): boolean {
    return !!parseFunctionOrValue(this.#options.enabled, this)
  }

  /**
   * Returns the current debouncer wait state
   */
  getWait(): number {
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
  async maybeExecute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    this.#cancel()
    this.#setState({ lastArgs: args })

    // Handle leading execution
    if (this.#options.leading && this.#state.canLeadingExecute) {
      this.#setState({ canLeadingExecute: false })
      await this.#execute(...args)
      return this.#state.lastResult
    }

    // Handle trailing execution
    if (this.#options.trailing) {
      this.#setState({ isPending: true })
    }

    return new Promise((resolve) => {
      this.#resolvePreviousPromise = resolve
      this.#timeoutId = setTimeout(async () => {
        // Execute trailing if enabled
        if (this.#options.trailing && this.#state.lastArgs) {
          await this.#execute(...this.#state.lastArgs)
        }

        // Reset state and resolve
        this.#setState({ canLeadingExecute: true })
        this.#resolvePreviousPromise = null
        resolve(this.#state.lastResult)
      }, this.getWait())
    })
  }

  async #execute(
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> {
    if (!this.getEnabled()) return undefined
    this.#abortController = new AbortController()
    try {
      this.#setState({ isExecuting: true })
      const result = await this.fn(...args) // EXECUTE!
      this.#setState({
        lastResult: result,
        successCount: this.#state.successCount + 1,
      })
      this.#options.onSuccess?.(result, this)
    } catch (error) {
      this.#setState({
        errorCount: this.#state.errorCount + 1,
      })
      this.#options.onError?.(error, this)
      if (this.#options.throwOnError) {
        throw error
      }
    } finally {
      this.#setState({
        isExecuting: false,
        isPending: false,
        settleCount: this.#state.settleCount + 1,
      })
      this.#abortController = null
      this.#options.onSettled?.(this)
    }
    return this.#state.lastResult
  }

  /**
   * Cancel without resetting canLeadingExecute
   */
  #cancel(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
    }
    if (this.#resolvePreviousPromise) {
      this.#resolvePreviousPromise(this.#state.lastResult)
      this.#resolvePreviousPromise = null
    }
    this.#state.lastArgs = undefined
    this.#setState({ isPending: false, isExecuting: false })
  }

  /**
   * Cancels any pending execution or aborts any execution in progress
   */
  cancel(): void {
    this.#setState({ canLeadingExecute: true })
    this.#cancel()
  }

  /**
   * Returns the last result of the debounced function
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
   * Returns `true` if there is a pending execution queued up for trailing execution
   */
  getIsPending(): boolean {
    return this.getEnabled() && this.#state.isPending
  }

  /**
   * Returns `true` if there is currently an execution in progress
   */
  getIsExecuting(): boolean {
    return this.#state.isExecuting
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
  return asyncDebouncer.maybeExecute.bind(asyncDebouncer)
}
