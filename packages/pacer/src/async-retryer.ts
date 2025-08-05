import { Store } from '@tanstack/store'
import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction } from './types'

export interface AsyncRetryerState<TFn extends AnyAsyncFunction> {
  /**
   * The current retry attempt number (0 when not executing)
   */
  currentAttempt: number
  /**
   * Total number of completed executions (successful or failed)
   */
  executionCount: number
  /**
   * Whether the retryer is currently executing the function
   */
  isExecuting: boolean
  /**
   * The most recent error encountered during execution
   */
  lastError: Error | undefined
  /**
   * Timestamp of the last execution completion in milliseconds
   */
  lastExecutionTime: number
  /**
   * The result from the most recent successful execution
   */
  lastResult: ReturnType<TFn> | undefined
  /**
   * Current execution status - 'disabled' when not enabled, 'idle' when ready, 'executing' when running
   */
  status: 'disabled' | 'idle' | 'executing' | 'retrying'
  /**
   * Total time spent executing (including retries) in milliseconds
   */
  totalExecutionTime: number
}

/**
 * Creates the default initial state for an AsyncRetryer instance
 * @returns The default state with all values reset to initial values
 */
function getDefaultAsyncRetryerState<
  TFn extends AnyAsyncFunction,
>(): AsyncRetryerState<TFn> {
  return structuredClone({
    currentAttempt: 0,
    executionCount: 0,
    isExecuting: false,
    lastError: undefined,
    lastExecutionTime: 0,
    lastResult: undefined,
    status: 'idle',
    totalExecutionTime: 0,
  })
}

export interface AsyncRetryerOptions<TFn extends AnyAsyncFunction> {
  /**
   * The backoff strategy for retry delays:
   * - 'exponential': Wait time doubles with each attempt (1s, 2s, 4s, ...)
   * - 'linear': Wait time increases linearly (1s, 2s, 3s, ...)
   * - 'fixed': Same wait time for all attempts
   * @default 'exponential'
   */
  backoff?: 'linear' | 'exponential' | 'fixed'
  /**
   * Base wait time in milliseconds between retries, or a function that returns the wait time
   * @default 1000
   */
  baseWait?: number | ((retryer: AsyncRetryer<TFn>) => number)
  /**
   * Whether the retryer is enabled, or a function that determines if it's enabled
   * @default true
   */
  enabled?: boolean | ((retryer: AsyncRetryer<TFn>) => boolean)
  /**
   * Initial state to merge with the default state
   */
  initialState?: Partial<AsyncRetryerState<TFn>>
  /**
   * Maximum number of retry attempts, or a function that returns the max attempts
   * @default 3
   */
  maxAttempts?: number | ((retryer: AsyncRetryer<TFn>) => number)
  /**
   * Callback invoked when any error occurs during execution (including retries)
   */
  onError?: (
    error: unknown,
    args: Parameters<TFn>,
    retryer: AsyncRetryer<TFn>,
  ) => void
  /**
   * Callback invoked when the final error occurs after all retries are exhausted
   */
  onLastError?: (error: Error, retryer: AsyncRetryer<TFn>) => void
  /**
   * Callback invoked before each retry attempt
   */
  onRetry?: (attempt: number, error: Error, retryer: AsyncRetryer<TFn>) => void
  /**
   * Callback invoked after execution completes (success or failure)
   */
  onSettled?: (args: Parameters<TFn>, retryer: AsyncRetryer<TFn>) => void
  /**
   * Callback invoked when execution succeeds
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    args: Parameters<TFn>,
    retryer: AsyncRetryer<TFn>,
  ) => void
  /**
   * Controls when errors are thrown:
   * - 'last': Only throw the final error after all retries are exhausted
   * - true: Throw every error immediately (disables retrying)
   * - false: Never throw errors, return undefined instead
   * @default 'last'
   */
  throwOnError?: boolean | 'last'
}

const defaultOptions: Omit<
  Required<AsyncRetryerOptions<any>>,
  | 'initialState'
  | 'onError'
  | 'onLastError'
  | 'onRetry'
  | 'onSettled'
  | 'onSuccess'
> = {
  backoff: 'exponential',
  baseWait: 1000,
  enabled: true,
  maxAttempts: 3,
  throwOnError: 'last',
}

/**
 * Provides robust retry functionality for asynchronous functions, supporting configurable backoff strategies,
 * attempt limits, and detailed state management. The AsyncRetryer class is designed to help you reliably
 * execute async operations that may fail intermittently, such as network requests or database operations,
 * by automatically retrying them according to your chosen policy.
 *
 * ## Retrying Concepts
 *
 * - **Retrying**: Automatically re-executes a failed async function up to a specified number of attempts.
 *   Useful for handling transient errors (e.g., network flakiness, rate limits, temporary server issues).
 * - **Backoff Strategies**: Controls the delay between retry attempts (default: `'exponential'`):
 *   - `'exponential'`: Wait time doubles with each attempt (1s, 2s, 4s, ...) - **DEFAULT**
 *   - `'linear'`: Wait time increases linearly (1s, 2s, 3s, ...)
 *   - `'fixed'`: Waits a constant amount of time (`baseWait`) between each attempt
 * - **Abort & Cancellation**: Supports cancellation via an internal `AbortController`. If cancelled, retries are stopped.
 * - **State Management**: Tracks execution status, current attempt, last error, and result using TanStack Store.
 * - **Callbacks**: Provides hooks for handling success, error, retry, and settled events.
 *
 * ## State Management
 * - Uses TanStack Store for fine-grained reactivity.
 * - State includes: `isExecuting`, `currentAttempt`, `lastError`, `lastResult`, and `status` (`idle`, `executing`, `retrying`, `disabled`).
 * - State can be accessed via the `store.state` property.
 *
 * ## Error Handling
 * The `throwOnError` option controls when errors are thrown (default: `'last'`):
 * - `'last'`: Only throws the final error after all retries are exhausted - **DEFAULT**
 * - `true`: Throws every error immediately (no retries)
 * - `false`: Never throws errors, returns `undefined` instead
 *
 * Additional error handling:
 * - `onError`: Called for every error (including during retries)
 * - `onLastError`: Called only for the final error after all retries fail
 * - If `onError` is provided but `throwOnError` is not specified, defaults to `'last'`
 *
 * ## Usage
 * - Use for async operations that may fail transiently and benefit from retrying.
 * - Configure `maxAttempts`, `backoff`, and `baseWait` to control retry behavior.
 * - Use `onRetry`, `onSuccess`, `onError`, and `onSettled` for custom side effects.
 *
 * @example
 * ```typescript
 * // Retry a fetch operation up to 5 times with exponential backoff
 * const retryer = new AsyncRetryer(fetchData, {
 *   maxAttempts: 5,
 *   backoff: 'exponential',
 *   baseWait: 1000,
 *   onRetry: (attempt, error) => console.log(`Retry attempt ${attempt} after error:`, error),
 *   onSuccess: (result) => console.log('Success:', result),
 *   onError: (error) => console.error('Error:', error),
 *   onLastError: (error) => console.error('All retries failed:', error),
 * })
 *
 * const result = await retryer.execute(userId)
 * ```
 *
 * @template TFn The async function type to be retried.
 */
export class AsyncRetryer<TFn extends AnyAsyncFunction> {
  readonly store: Store<Readonly<AsyncRetryerState<TFn>>> = new Store(
    getDefaultAsyncRetryerState<TFn>(),
  )
  options: AsyncRetryerOptions<TFn> & typeof defaultOptions
  #abortController: AbortController | null = null

  /**
   * Creates a new AsyncRetryer instance
   * @param fn The async function to retry
   * @param initialOptions Configuration options for the retryer
   */
  constructor(
    public fn: TFn,
    initialOptions: AsyncRetryerOptions<TFn> = {},
  ) {
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError:
        initialOptions.throwOnError ??
        (initialOptions.onError ? false : defaultOptions.throwOnError),
    }
    this.#setState(this.options.initialState ?? {})
  }

  /**
   * Updates the retryer options
   * @param newOptions Partial options to merge with existing options
   */
  setOptions = (newOptions: Partial<AsyncRetryerOptions<TFn>>): void => {
    this.options = { ...this.options, ...newOptions }
  }

  #setState = (newState: Partial<AsyncRetryerState<TFn>>): void => {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }
      const { isExecuting, currentAttempt } = combinedState
      return {
        ...combinedState,
        status: !this.#getEnabled()
          ? 'disabled'
          : isExecuting && currentAttempt === 1
            ? 'executing'
            : isExecuting && currentAttempt > 1
              ? 'retrying'
              : 'idle',
      }
    })
  }

  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.options.enabled, this)
  }

  #getMaxAttempts = (): number => {
    return parseFunctionOrValue(this.options.maxAttempts, this)
  }

  #getBaseWait = (): number => {
    return parseFunctionOrValue(this.options.baseWait, this)
  }

  #calculateWait = (attempt: number): number => {
    const baseWait = this.#getBaseWait()

    switch (this.options.backoff) {
      case 'linear':
        return baseWait * attempt
      case 'exponential':
        return baseWait * Math.pow(2, attempt - 1)
      case 'fixed':
      default:
        return baseWait
    }
  }

  /**
   * Executes the function with retry logic
   * @param args Arguments to pass to the function
   * @returns The function result, or undefined if disabled or all retries failed (when throwOnError is false)
   * @throws The last error if throwOnError is true and all retries fail
   */
  execute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled()) {
      return undefined
    }

    // Cancel any existing execution
    this.cancel()

    const startTime = Date.now()
    let lastError: Error | undefined
    let result: ReturnType<TFn> | undefined

    this.#abortController = new AbortController()
    const signal = this.#abortController.signal

    this.#setState({
      isExecuting: true,
      currentAttempt: 0,
      lastError: undefined,
    })

    try {
      let isLastAttempt = false
      for (let attempt = 1; attempt <= this.#getMaxAttempts(); attempt++) {
        isLastAttempt = attempt === this.#getMaxAttempts()
        this.#setState({ currentAttempt: attempt })

        try {
          // Check if cancelled before executing
          if (signal.aborted) {
            throw new Error('Retry cancelled')
          }

          result = (await this.fn(...args)) as ReturnType<TFn>

          const totalTime = Date.now() - startTime
          this.#setState({
            executionCount: this.store.state.executionCount + 1,
            isExecuting: false,
            lastExecutionTime: Date.now(),
            totalExecutionTime: totalTime,
            currentAttempt: 0,
            lastResult: result,
          })

          this.options.onSuccess?.(result, args, this)

          return result
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          this.#setState({ lastError })

          if (attempt < this.#getMaxAttempts()) {
            this.options.onRetry?.(attempt, lastError, this)

            const wait = this.#calculateWait(attempt)
            if (wait > 0) {
              await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(resolve, wait)
                signal.addEventListener('abort', () => {
                  clearTimeout(timeout)
                  reject(new Error('Retry cancelled'))
                })
              })
            }
          }
        } finally {
          this.options.onSettled?.(args, this)
        }
      }

      this.#setState({
        isExecuting: false,
        currentAttempt: 0,
      })

      this.options.onLastError?.(lastError!, this)
      this.options.onError?.(lastError!, args, this)
      this.options.onSettled?.(args, this)

      if (
        (this.options.throwOnError === 'last' && isLastAttempt) ||
        this.options.throwOnError === true
      ) {
        throw lastError
      }

      return undefined as any
    } catch (error) {
      // Don't rethrow if the error was from cancellation
      if (error instanceof Error && error.message === 'Retry cancelled') {
        return undefined
      }

      this.#setState({
        isExecuting: false,
        currentAttempt: 0,
      })

      const errorToHandle =
        error instanceof Error ? error : new Error(String(error))
      this.options.onError?.(errorToHandle, args, this)
      this.options.onSettled?.(args, this)

      throw error
    } finally {
      this.#abortController = null
    }
  }

  /**
   * Cancels the current execution and any pending retries
   */
  cancel = (): void => {
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
      this.#setState({
        isExecuting: false,
        currentAttempt: 0,
      })
    }
  }

  /**
   * Resets the retryer to its initial state and cancels any ongoing execution
   */
  reset = (): void => {
    this.cancel()
    this.#setState(getDefaultAsyncRetryerState<TFn>())
  }
}

/**
 * Creates a retry-enabled version of an async function
 *
 * @param fn The async function to add retry functionality to
 * @param initialOptions Configuration options for the retry behavior
 * @returns A new function that executes the original with retry logic
 *
 * @example
 * ```typescript
 * const retryFetch = asyncRetry(fetch, {
 *   maxAttempts: 3,
 *   backoff: 'exponential'
 * })
 *
 * const response = await retryFetch('/api/data')
 * ```
 */
export function asyncRetry<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncRetryerOptions<TFn> = {},
): (...args: Parameters<TFn>) => Promise<ReturnType<TFn> | undefined> {
  const retryer = new AsyncRetryer(fn, initialOptions)
  return retryer.execute
}
