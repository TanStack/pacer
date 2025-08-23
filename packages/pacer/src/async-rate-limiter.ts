import { Store } from '@tanstack/store'
import { createKey, parseFunctionOrValue } from './utils'
import { emitChange, pacerEventClient } from './event-client'
import type { AnyAsyncFunction } from './types'

export interface AsyncRateLimiterState<TFn extends AnyAsyncFunction> {
  /**
   * Number of function executions that have resulted in errors
   */
  errorCount: number
  /**
   * Array of timestamps when executions occurred for rate limiting calculations
   */
  executionTimes: Array<number>
  /**
   * Whether the rate limiter has exceeded the limit
   */
  isExceeded: boolean
  /**
   * Whether the rate-limited function is currently executing asynchronously
   */
  isExecuting: boolean
  /**
   * The result from the most recent successful function execution
   */
  lastResult: ReturnType<TFn> | undefined
  /**
   * Number of function executions that have been rejected due to rate limiting
   */
  rejectionCount: number
  /**
   * Number of function executions that have completed (either successfully or with errors)
   */
  settleCount: number
  /**
   * Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
   */
  status: 'disabled' | 'executing' | 'exceeded' | 'idle'
  /**
   * Number of function executions that have completed successfully
   */
  successCount: number
  /**
   * Number of times maybeExecute has been called (for reduction calculations)
   */
  maybeExecuteCount: number
}

function getDefaultAsyncRateLimiterState<
  TFn extends AnyAsyncFunction,
>(): AsyncRateLimiterState<TFn> {
  return {
    errorCount: 0,
    executionTimes: [],
    isExceeded: false,
    isExecuting: false,
    lastResult: undefined,
    maybeExecuteCount: 0,
    rejectionCount: 0,
    settleCount: 0,
    status: 'idle',
    successCount: 0,
  }
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
  initialState?: Partial<AsyncRateLimiterState<TFn>>
  /**
   * Optional key to identify this async rate limiter instance.
   * If provided, the async rate limiter will be identified by this key in the devtools and PacerProvider if applicable.
   */
  key?: string
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
  onError?: (
    error: unknown,
    args: Parameters<TFn>,
    rateLimiter: AsyncRateLimiter<TFn>,
  ) => void
  /**
   * Optional callback function that is called when an execution is rejected due to rate limiting
   */
  onReject?: (args: Parameters<TFn>, rateLimiter: AsyncRateLimiter<TFn>) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSettled?: (
    args: Parameters<TFn>,
    rateLimiter: AsyncRateLimiter<TFn>,
  ) => void
  /**
   * Optional function to call when the rate-limited function is executed
   */
  onSuccess?: (
    result: ReturnType<TFn>,
    args: Parameters<TFn>,
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
  'initialState' | 'onError' | 'onReject' | 'onSettled' | 'onSuccess' | 'key'
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
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - `initialState` can be a partial state object
 * - Use `onSuccess` callback to react to successful function execution and implement custom logic
 * - Use `onError` callback to react to function execution errors and implement custom error handling
 * - Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
 * - Use `onReject` callback to react to executions being rejected when rate limit is exceeded
 * - The state includes execution times, success/error counts, and current execution status
 * - State can be accessed via `asyncRateLimiter.store.state` when using the class directly
 * - When using framework adapters (React/Solid), state is accessed from `asyncRateLimiter.state`
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
  readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>> = new Store<
    AsyncRateLimiterState<TFn>
  >(getDefaultAsyncRateLimiterState<TFn>())
  key: string
  options: AsyncRateLimiterOptions<TFn>
  #timeoutIds: Set<NodeJS.Timeout> = new Set()

  constructor(
    public fn: TFn,
    initialOptions: AsyncRateLimiterOptions<TFn>,
  ) {
    this.key = createKey(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.options.initialState ?? {})
    for (const executionTime of this.#getExecutionTimesInWindow()) {
      this.#setCleanupTimeout(executionTime)
    }

    pacerEventClient.on('d-AsyncRateLimiter', (event) => {
      if (event.payload.key !== this.key) return
      this.#setState(event.payload.store.state)
      this.setOptions(event.payload.options)
    })
  }

  /**
   * Updates the async rate limiter options
   */
  setOptions = (newOptions: Partial<AsyncRateLimiterOptions<TFn>>): void => {
    this.options = { ...this.options, ...newOptions }
  }

  #setState = (newState: Partial<AsyncRateLimiterState<TFn>>): void => {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }
      const isExceeded = combinedState.executionTimes.length >= this.#getLimit()
      const status = !this.#getEnabled()
        ? 'disabled'
        : combinedState.isExecuting
          ? 'executing'
          : isExceeded
            ? 'exceeded'
            : 'idle'
      return {
        ...combinedState,
        isExceeded,
        status,
      }
    })
    emitChange('AsyncRateLimiter', this)
  }

  /**
   * Returns the current enabled state of the async rate limiter
   */
  #getEnabled = (): boolean => {
    return !!parseFunctionOrValue(this.options.enabled, this)
  }

  /**
   * Returns the current limit of executions allowed within the time window
   */
  #getLimit = (): number => {
    return parseFunctionOrValue(this.options.limit, this)
  }

  /**
   * Returns the current time window in milliseconds
   */
  #getWindow = (): number => {
    return parseFunctionOrValue(this.options.window, this)
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
    this.#setState({
      maybeExecuteCount: this.store.state.maybeExecuteCount + 1,
    })

    this.#cleanupOldExecutions()

    const relevantExecutionTimes = this.#getExecutionTimesInWindow()

    if (relevantExecutionTimes.length < this.#getLimit()) {
      await this.#execute(...args)
      return this.store.state.lastResult
    }

    this.#setState({
      rejectionCount: this.store.state.rejectionCount + 1,
    })
    this.options.onReject?.(args, this)
    return undefined
  }

  #execute = async (
    ...args: Parameters<TFn>
  ): Promise<ReturnType<TFn> | undefined> => {
    if (!this.#getEnabled()) return

    const now = Date.now()
    const executionTimes = [...this.store.state.executionTimes, now]
    this.#setState({
      isExecuting: true,
      executionTimes,
    })

    try {
      const result = await this.fn(...args) // EXECUTE!
      this.#setCleanupTimeout(now)
      this.#setState({
        successCount: this.store.state.successCount + 1,
        lastResult: result,
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
        settleCount: this.store.state.settleCount + 1,
      })
      this.options.onSettled?.(args, this)
    }

    return this.store.state.lastResult
  }

  #getExecutionTimesInWindow = (): Array<number> => {
    if (this.options.windowType === 'sliding') {
      // For sliding window, return all executions within the current window
      return this.store.state.executionTimes.filter(
        (time) => time > Date.now() - this.#getWindow(),
      )
    } else {
      // For fixed window, return all executions in the current window
      // The window starts from the oldest execution time
      if (this.store.state.executionTimes.length === 0) {
        return []
      }
      const oldestExecution = Math.min(...this.store.state.executionTimes)
      const windowStart = oldestExecution
      const windowEnd = windowStart + this.#getWindow()
      const now = Date.now()

      // If the window has expired, return empty array
      if (now > windowEnd) {
        return []
      }

      // Otherwise, return all executions in the current window
      return this.store.state.executionTimes.filter(
        (time) => time >= windowStart && time <= windowEnd,
      )
    }
  }

  #setCleanupTimeout = (executionTime: number): void => {
    if (
      this.options.windowType === 'sliding' ||
      this.#timeoutIds.size === 0 // new fixed window
    ) {
      const now = Date.now()
      const timeUntilExpiration = executionTime - now + this.#getWindow() + 1
      const timeoutId = setTimeout(() => {
        this.#cleanupOldExecutions()
        this.#clearTimeout(timeoutId)
      }, timeUntilExpiration)
      this.#timeoutIds.add(timeoutId)
    }
  }

  #clearTimeout = (timeoutId: NodeJS.Timeout): void => {
    clearTimeout(timeoutId)
    this.#timeoutIds.delete(timeoutId)
  }

  #clearTimeouts = (): void => {
    this.#timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId))
    this.#timeoutIds.clear()
  }

  #cleanupOldExecutions = (): void => {
    this.#setState({
      executionTimes: this.#getExecutionTimesInWindow(),
    })
  }

  /**
   * Returns the number of remaining executions allowed in the current window
   */
  getRemainingInWindow = (): number => {
    const relevantExecutionTimes = this.#getExecutionTimesInWindow()
    return Math.max(0, this.#getLimit() - relevantExecutionTimes.length)
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
    const oldestExecution = this.store.state.executionTimes[0] ?? Infinity
    return oldestExecution + this.#getWindow() - Date.now()
  }

  /**
   * Resets the rate limiter state
   */
  reset = (): void => {
    this.#setState(getDefaultAsyncRateLimiterState())
    this.#clearTimeouts()
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
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the rate limiter
 * - `initialState` can be a partial state object
 * - Use `onSuccess` callback to react to successful function execution and implement custom logic
 * - Use `onError` callback to react to function execution errors and implement custom error handling
 * - Use `onSettled` callback to react to function execution completion (success or error) and implement custom logic
 * - Use `onReject` callback to react to executions being rejected when rate limit is exceeded
 * - The state includes execution times, success/error counts, and current execution status
 * - State can be accessed via the underlying AsyncRateLimiter instance's `store.state` property
 * - When using framework adapters (React/Solid), state is accessed from the hook's state property
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
