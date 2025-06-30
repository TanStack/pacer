import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction } from './types'

export interface AsyncRateLimiterState<TFn extends AnyAsyncFunction> {
  errorCount: number
  executionTimes: Array<number>
  isExecuting: boolean
  lastResult: ReturnType<TFn> | undefined
  rejectionCount: number
  settleCount: number
  successCount: number
}

/**
 * Options for configuring an async rate-limited function
 */
export interface AsyncRateLimiterOptions<TFn extends AnyAsyncFunction> {
  /**
   * Whether the rate limiter is enabled. When disabled, maybeExecute will not trigger any executions.
   * Can be a boolean or a function that returns a boolean.
   * Defaults to true.
   */
  enabled?: boolean | ((rateLimiter: AsyncRateLimiter<TFn>) => boolean)
  /**
   * Initial state for the rate limiter
   */
  initialState?:
    | Partial<AsyncRateLimiterState<TFn>>
    | Promise<Partial<AsyncRateLimiterState<TFn>>>
  /**
   * Maximum number of executions allowed within the time window.
   * Can be a number or a function that returns a number.
   */
  limit: number | ((rateLimiter: AsyncRateLimiter<TFn>) => number)
  /**
   * Optional error handler for when the rate-limited function throws.
   * If provided, the handler will be called with the error and rate limiter instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (error: unknown, rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSettled?: (rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    rateLimiter: AsyncRateLimiter<TFn>,
  ) => void
  /**
   * Callback function that is called when the state of the rate limiter is updated
   */
  onStateChange?: (
    state: AsyncRateLimiterState<TFn>,
    rateLimiter: AsyncRateLimiter<TFn>,
  ) => void
  /**
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Time window in milliseconds within which the limit applies.
   * Can be a number or a function that returns a number.
   */
  window: number | ((rateLimiter: AsyncRateLimiter<TFn>) => number)
  /**
   * Type of window to use for rate limiting
   * - 'fixed': Uses a fixed window that resets after the window period
   * - 'sliding': Uses a sliding window that allows executions as old ones expire
   * Defaults to 'fixed'
   */
  windowType?: 'fixed' | 'sliding'
}

const defaultOptions: Omit<
  Required<AsyncRateLimiterOptions<any>>,
  | 'initialState'
  | 'onStateChange'
  | 'onError'
  | 'onReject'
  | 'onSettled'
  | 'onSuccess'
> = {
  enabled: true,
  limit: 1,
  window: 0,
  windowType: 'fixed',
  throwOnError: true,
}

/**
 * A class that creates an async rate-limited function.
 *
 * Rate limiting is a simple approach that allows a function to execute up to a limit within a time window,
 * then blocks all subsequent calls until the window passes. This can lead to "bursty" behavior where
 * all executions happen immediately, followed by a complete block.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * Unlike the non-async RateLimiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * For smoother execution patterns, consider using:
 * - Throttling: Ensures consistent spacing between executions (e.g. max once per 200ms)
 * - Debouncing: Waits for a pause in calls before executing (e.g. after 500ms of no calls)
 *
 * Rate limiting is best used for hard API limits or resource constraints. For UI updates or
 * smoothing out frequent events, throttling or debouncing usually provide better user experience.
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - `initialState` can be a partial state object or a Promise that resolves to a partial state
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution times, success/error counts, and current execution status
 * - State can be retrieved using `getState()` method
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * @example
 * ```ts
 * const rateLimiter = new AsyncRateLimiter(
 *   async (id: string) => await api.getData(id),
 *   {
 *     limit: 5,
 *     window: 1000,
 *     windowType: 'sliding',
 *     onError: (error) => {
 *       console.error('API call failed:', error);
 *     },
 *     onReject: (limiter) => {
 *       console.log(`Rate limit exceeded. Try again in ${limiter.getMsUntilNextWindow()}ms`);
 *     }
 *   }
 * );
 *
 * // Will execute immediately until limit reached, then block
 * // Returns the API response directly
 * const data = await rateLimiter.maybeExecute('123');
 * ```
 */
export class AsyncRateLimiter<TFn extends AnyAsyncFunction> {
  #options: AsyncRateLimiterOptions<TFn>
  #state: AsyncRateLimiterState<TFn> = {
    errorCount: 0,
    executionTimes: [],
    isExecuting: false,
    lastResult: undefined,
    rejectionCount: 0,
    settleCount: 0,
    successCount: 0,
  }

  constructor(
    private fn: TFn,
    initialOptions: AsyncRateLimiterOptions<TFn>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    if (this.#options.initialState instanceof Promise) {
      this.#options.initialState.then((state) => {
        this.#setState(state)
      })
    } else {
      this.#state = {
        ...this.#state,
        ...this.#options.initialState,
      }
    }
  }

  /**
   * Updates the async rate limiter options
   */
  setOptions = (newOptions: Partial<AsyncRateLimiterOptions<TFn>>): void => {
    this.#options = { ...this.#options, ...newOptions }
  }

  /**
   * Returns the current async rate limiter options
   */
  getOptions = (): Required<AsyncRateLimiterOptions<TFn>> => {
    return this.#options as Required<AsyncRateLimiterOptions<TFn>>
  }

  getState = (): AsyncRateLimiterState<TFn> => {
    return { ...this.#state }
  }

  #setState = (newState: Partial<AsyncRateLimiterState<TFn>>): void => {
    this.#state = { ...this.#state, ...newState }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Returns the current enabled state of the async rate limiter
   */
  getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.#options.enabled, this)
  }

  /**
   * Returns the current limit of executions allowed within the time window
   */
  getLimit = (): number => {
    return parseFunctionOrValue(this.#options.limit, this)
  }

  /**
   * Returns the current time window in milliseconds
   */
  getWindow = (): number => {
    return parseFunctionOrValue(this.#options.window, this)
  }

  /**
   * Attempts to execute the rate-limited function if within the configured limits.
   * Will reject execution if the number of calls in the current window exceeds the limit.
   *
   * Error Handling:
   * - If the rate-limited function throws and no `onError` handler is configured,
   *   the error will be thrown from this method.
   * - If an `onError` handler is configured, errors will be caught and passed to the handler,
   *   and this method will return undefined.
   * - The error state can be checked using `getErrorCount()` and `getIsExecuting()`.
   *
   * @returns A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError
   * @throws The error from the rate-limited function if no onError handler is configured
   *
   * @example
   * ```ts
   * const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });
   *
   * // First 5 calls will return a promise that resolves with the result
   * const result = await rateLimiter.maybeExecute('arg1', 'arg2');
   *
   * // Additional calls within the window will return undefined
   * const result2 = await rateLimiter.maybeExecute('arg1', 'arg2'); // undefined
   * ```
   */
  maybeExecute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    this.#cleanupOldExecutions()

    const limit = this.getLimit()
    const window = this.getWindow()

    if (this.#options.windowType === 'sliding') {
      // For sliding window, we can execute if we have capacity in the current window
      if (this.#state.executionTimes.length < limit) {
        await this.#execute(...args)
        return this.#state.lastResult
      }
    } else {
      // For fixed window, we need to check if we're in a new window
      const now = Date.now()
      const oldestExecution = Math.min(...this.#state.executionTimes)
      const isNewWindow = oldestExecution + window <= now

      if (isNewWindow || this.#state.executionTimes.length < limit) {
        await this.#execute(...args)
        return this.#state.lastResult
      }
    }

    this.#rejectFunction()
    return undefined
  }

  #execute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.getEnabled()) return
    const now = Date.now()
    this.#state.executionTimes.push(now) // mutate state directly for performance
    this.#setState({
      isExecuting: true,
    })

    try {
      const result = await this.fn(...args)
      this.#setState({
        successCount: this.#state.successCount + 1,
        lastResult: result,
      })
      this.#options.onSuccess?.(result, this)
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
      })
      this.#options.onSettled?.(this)
    }

    return this.#state.lastResult
  }

  #rejectFunction = (): void => {
    this.#setState({
      rejectionCount: this.#state.rejectionCount + 1,
    })
    this.#options.onReject?.(this)
  }

  #cleanupOldExecutions = (): void => {
    const now = Date.now()
    const windowStart = now - this.getWindow()
    this.#setState({
      executionTimes: this.#state.executionTimes.filter(
        (time) => time > windowStart,
      ),
    })
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow = (): number => {
    this.#cleanupOldExecutions()
    return Math.max(0, this.getLimit() - this.#state.executionTimes.length)
  }

  /**
   * Returns the number of milliseconds until the next execution will be possible
   * For fixed windows, this is the time until the current window resets
   * For sliding windows, this is the time until the oldest execution expires
   */
  getMsUntilNextWindow = (): number => {
    if (this.getRemainingInWindow() > 0) {
      return 0
    }
    const oldestExecution = this.#state.executionTimes[0] ?? Infinity
    return oldestExecution + this.getWindow() - Date.now()
  }

  /**
   * Returns the number of times the function has been executed
   */
  getSuccessCount = (): number => {
    return this.#state.successCount
  }

  /**
   * Returns the number of times the function has been settled
   */
  getSettleCount = (): number => {
    return this.#state.settleCount
  }

  /**
   * Returns the number of times the function has errored
   */
  getErrorCount = (): number => {
    return this.#state.errorCount
  }

  /**
   * Returns the number of times the function has been rejected
   */
  getRejectionCount = (): number => {
    return this.#state.rejectionCount
  }

  /**
   * Returns whether the function is currently executing
   */
  getIsExecuting = (): boolean => {
    return this.#state.isExecuting
  }

  /**
   * Resets the rate limiter state
   */
  reset = (): void => {
    this.#setState({
      executionTimes: [],
      rejectionCount: 0,
      errorCount: 0,
      settleCount: 0,
      successCount: 0,
      isExecuting: false,
      lastResult: undefined,
    })
  }
}

/**
 * Creates an async rate-limited function that will execute the provided function up to a maximum number of times within a time window.
 *
 * Unlike the non-async rate limiter, this async version supports returning values from the rate-limited function,
 * making it ideal for API calls and other async operations where you want the result of the `maybeExecute` call
 * instead of setting the result on a state variable from within the rate-limited function.
 *
 * The rate limiter supports two types of windows:
 * - 'fixed': A strict window that resets after the window period. All executions within the window count
 *   towards the limit, and the window resets completely after the period.
 * - 'sliding': A rolling window that allows executions as old ones expire. This provides a more
 *   consistent rate of execution over time.
 *
 * Note that rate limiting is a simpler form of execution control compared to throttling or debouncing:
 * - A rate limiter will allow all executions until the limit is reached, then block all subsequent calls until the window resets
 * - A throttler ensures even spacing between executions, which can be better for consistent performance
 * - A debouncer collapses multiple calls into one, which is better for handling bursts of events
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - `initialState` can be a partial state object or a Promise that resolves to a partial state
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution times, success/error counts, and current execution status
 *
 * Consider using throttle() or debounce() if you need more intelligent execution control. Use rate limiting when you specifically
 * need to enforce a hard limit on the number of executions within a time period.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and rate limiter instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncRateLimiter instance
 * - Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler
 *
 * @example
 * ```ts
 * // Rate limit to 5 calls per minute with a sliding window
 * const rateLimited = asyncRateLimit(makeApiCall, {
 *   limit: 5,
 *   window: 60000,
 *   windowType: 'sliding',
 *   onError: (error) => {
 *     console.error('API call failed:', error);
 *   },
 *   onReject: (rateLimiter) => {
 *     console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
 *   }
 * });
 *
 * // First 5 calls will execute immediately
 * // Additional calls will be rejected until the minute window resets
 * // Returns the API response directly
 * const result = await rateLimited();
 *
 * // For more even execution, consider using throttle instead:
 * const throttled = throttle(makeApiCall, { wait: 12000 }); // One call every 12 seconds
 * ```
 */
export function asyncRateLimit<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: AsyncRateLimiterOptions<TFn>,
) {
  const rateLimiter = new AsyncRateLimiter(fn, initialOptions)
  return rateLimiter.maybeExecute
}
