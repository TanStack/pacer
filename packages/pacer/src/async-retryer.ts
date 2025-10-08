import { Store } from '@tanstack/store'
import { createKey, parseFunctionOrValue } from './utils'
import { emitChange, pacerEventClient } from './event-client'
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
   * Optional key to identify this async retryer instance.
   * If provided, the async retryer will be identified by this key in the devtools and PacerProvider if applicable.
   */
  key?: string
  /**
   * Jitter percentage to add to retry delays (0-1). Adds randomness to prevent thundering herd.
   * @default 0
   */
  jitter?: number
  /**
   * Maximum execution time in milliseconds for a single function call before aborting
   * @default Infinity
   */
  maxExecutionTime?: number
  /**
   * Maximum total execution time in milliseconds for the entire retry operation before aborting
   * @default Infinity
   */
  maxTotalExecutionTime?: number
  /**
   * Maximum number of retry attempts, or a function that returns the max attempts
   * @default 3
   */
  maxAttempts?: number | ((retryer: AsyncRetryer<TFn>) => number)
  /**
   * Callback invoked when any error occurs during execution (including retries)
   */
  onError?: (
    error: Error,
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
  | 'key'
  | 'onError'
  | 'onLastError'
  | 'onRetry'
  | 'onSettled'
  | 'onSuccess'
> = {
  backoff: 'exponential',
  baseWait: 1000,
  enabled: true,
  jitter: 0,
  maxAttempts: 3,
  maxExecutionTime: Infinity,
  maxTotalExecutionTime: Infinity,
  throwOnError: 'last',
}

/**
 * Provides robust retry functionality for asynchronous functions, supporting configurable backoff strategies,
 * attempt limits, timeout controls, and detailed state management. The AsyncRetryer class is designed to help you reliably
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
 * - **Jitter**: Adds randomness to retry delays to prevent thundering herd problems (default: `0`).
 *   Set to a value between 0-1 to apply that percentage of random variation to each delay.
 * - **Timeout Controls**: Set limits on execution time to prevent hanging operations:
 *   - `maxExecutionTime`: Maximum time for a single function call (default: `Infinity`)
 *   - `maxTotalExecutionTime`: Maximum time for the entire retry operation (default: `Infinity`)
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
 * - Configure `maxAttempts`, `backoff`, `baseWait`, and `jitter` to control retry behavior.
 * - Set `maxExecutionTime` and `maxTotalExecutionTime` to prevent hanging operations.
 * - Use `onRetry`, `onSuccess`, `onError`, and `onSettled` for custom side effects.
 *
 * @example
 * ```typescript
 * // Retry a fetch operation up to 5 times with exponential backoff, jitter, and timeouts
 * const retryer = new AsyncRetryer(fetchData, {
 *   maxAttempts: 5,
 *   backoff: 'exponential',
 *   baseWait: 1000,
 *   jitter: 0.1, // Add 10% random variation to prevent thundering herd
 *   maxExecutionTime: 5000, // Abort individual calls after 5 seconds
 *   maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
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
  key: string
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
    this.key = createKey(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError:
        initialOptions.throwOnError ??
        (initialOptions.onError ? false : defaultOptions.throwOnError),
    }
    this.#setState(this.options.initialState ?? {})

    pacerEventClient.on('d-AsyncRetryer', (event) => {
      if (event.payload.key !== this.key) return
      this.#setState(event.payload.store.state as AsyncRetryerState<TFn>)
      this.setOptions(event.payload.options)
    })
  }

  /**
   * Emits a change event for the async retryer instance. Mostly useful for devtools.
   */
  _emit = () => emitChange('AsyncRetryer', this)

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
    emitChange('AsyncRetryer', this)
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

  #calculateJitter = (waitTime: number): number => {
    const jitterAmount = this.options.jitter
    if (jitterAmount <= 0) return 0

    try {
      const crypto =
        typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
      if (crypto?.getRandomValues) {
        const array = new Uint32Array(1)
        crypto.getRandomValues(array)
        // Convert to 0-1 range and apply jitter percentage
        const randomFactor = (array[0]! / 0xffffffff) * 2 - 1 // -1 to 1
        return Math.floor(waitTime * jitterAmount * randomFactor)
      }
    } catch {
      // No crypto available
    }
    return 0
  }

  #calculateWait = (attempt: number): number => {
    const baseWait = this.#getBaseWait()
    let waitTime: number

    switch (this.options.backoff) {
      case 'linear':
        waitTime = baseWait * attempt
        break
      case 'exponential':
        waitTime = baseWait * Math.pow(2, attempt - 1)
        break
      case 'fixed':
      default:
        waitTime = baseWait
        break
    }

    const jitter = this.#calculateJitter(waitTime)
    return Math.max(0, waitTime + jitter)
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
    this.abort()

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

    // Set up total execution timeout
    let totalTimeoutId: NodeJS.Timeout | undefined
    if (this.options.maxTotalExecutionTime !== Infinity) {
      totalTimeoutId = setTimeout(() => {
        this.abort()
      }, this.options.maxTotalExecutionTime)
    }

    let isLastAttempt = false
    for (let attempt = 1; attempt <= this.#getMaxAttempts(); attempt++) {
      isLastAttempt = attempt === this.#getMaxAttempts()
      this.#setState({ currentAttempt: attempt })

      try {
        if (signal.aborted) {
          return undefined
        }

        // Check if total execution time has been exceeded
        const currentTotalTime = Date.now() - startTime
        if (
          this.options.maxTotalExecutionTime !== Infinity &&
          currentTotalTime >= this.options.maxTotalExecutionTime
        ) {
          this.abort()
          return undefined
        }

        // Execute with individual timeout if specified
        if (this.options.maxExecutionTime === Infinity) {
          result = (await this.fn(...args)) as ReturnType<TFn>
        } else {
          result = (await Promise.race([
            this.fn(...args),
            new Promise<never>((_, reject) => {
              const timeout = setTimeout(() => {
                reject(
                  new Error(
                    `Execution timeout: ${this.options.maxExecutionTime}ms exceeded`,
                  ),
                )
              }, this.options.maxExecutionTime)

              signal.addEventListener(
                'abort',
                () => {
                  clearTimeout(timeout)
                  reject(new Error('Aborted'))
                },
                { once: true },
              )
            }),
          ])) as ReturnType<TFn>
        }

        // Check if cancelled during execution
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (signal.aborted) {
          return undefined
        }

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
        // Treat abort as a non-error cancellation outcome
        if (
          error &&
          typeof error === 'object' &&
          'name' in error &&
          (error as Error).name === 'AbortError'
        ) {
          return undefined
        }
        lastError = error instanceof Error ? error : new Error(String(error))
        this.#setState({ lastError })

        if (attempt < this.#getMaxAttempts()) {
          this.options.onRetry?.(attempt, lastError, this)

          const wait = this.#calculateWait(attempt)
          if (wait > 0) {
            // Eagerly reflect retrying status during the wait window
            this.#setState({ isExecuting: true, currentAttempt: attempt + 1 })
            await new Promise<void>((resolve) => {
              const timeout = setTimeout(() => {
                signal.removeEventListener('abort', onAbort)
                resolve()
              }, wait)
              const onAbort = () => {
                clearTimeout(timeout)
                signal.removeEventListener('abort', onAbort)
                resolve()
              }
              signal.addEventListener('abort', onAbort)
            })
            if (signal.aborted) {
              // When cancelled during retry wait, surface the last error exactly once
              this.options.onError?.(lastError, args, this)
              return undefined
            }
          }
        }
      } finally {
        this.options.onSettled?.(args, this)
      }
    }

    // Clean up total timeout
    if (totalTimeoutId) {
      clearTimeout(totalTimeoutId)
    }

    // Exhausted retries - finalize state
    this.#setState({ isExecuting: false })
    this.options.onLastError?.(lastError as Error, this)
    this.options.onError?.(lastError as Error, args, this)
    this.options.onSettled?.(args, this)

    if (
      (this.options.throwOnError === 'last' && isLastAttempt) ||
      this.options.throwOnError === true
    ) {
      throw lastError
    }

    return undefined
  }

  /**
   * Cancels the current execution and any pending retries
   */
  abort = (): void => {
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
      this.#setState({
        isExecuting: false,
      })
    }
  }

  /**
   * Resets the retryer to its initial state and cancels any ongoing execution
   */
  reset = (): void => {
    this.abort()
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
 *   backoff: 'exponential' // default
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
