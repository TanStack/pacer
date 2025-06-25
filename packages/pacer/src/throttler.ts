import { parseFunctionOrValue } from './utils'
import type { AnyFunction } from './types'

export interface ThrottlerState<TFn extends AnyFunction> {
  executionCount: number
  lastArgs: Parameters<TFn> | undefined
  lastExecutionTime: number
  nextExecutionTime: number
  isPending: boolean
}

/**
 * Options for configuring a throttled function
 */
export interface ThrottlerOptions<TFn extends AnyFunction> {
  /**
   * Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
   * Can be a boolean or a function that returns a boolean.
   * Defaults to true.
   */
  enabled?: boolean | ((throttler: Throttler<TFn>) => boolean)
  /**
   * Initial state for the throttler
   */
  initialState?: Partial<ThrottlerState<TFn>>
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to true.
   */
  leading?: boolean
  /**
   * Callback function that is called after the function is executed
   */
  onExecute?: (throttler: Throttler<TFn>) => void
  /**
   * Callback function that is called when the state of the throttler is updated
   */
  onStateChange?: (
    state: ThrottlerState<TFn>,
    throttler: Throttler<TFn>,
  ) => void
  /**
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true.
   */
  trailing?: boolean
  /**
   * Time window in milliseconds during which the function can only be executed once.
   * Can be a number or a function that returns a number.
   * Defaults to 0ms
   */
  wait: number | ((throttler: Throttler<TFn>) => number)
}

const defaultOptions: Omit<
  Required<ThrottlerOptions<any>>,
  'initialState' | 'onStateChange' | 'onExecute'
> = {
  enabled: true,
  leading: true,
  trailing: true,
  wait: 0,
}

/**
 * A class that creates a throttled function.
 *
 * Throttling ensures a function is called at most once within a specified time window.
 * Unlike debouncing which waits for a pause in calls, throttling guarantees consistent
 * execution timing regardless of call frequency.
 *
 * Supports both leading and trailing edge execution:
 * - Leading: Execute immediately on first call (default: true)
 * - Trailing: Execute after wait period if called during throttle (default: true)
 *
 * For collapsing rapid-fire events where you only care about the last call, consider using Debouncer.
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the throttler
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count and last execution time
 * - State can be retrieved using `getState()` method
 *
 * @example
 * ```ts
 * const throttler = new Throttler(
 *   (id: string) => api.getData(id),
 *   { wait: 1000 } // Execute at most once per second
 * );
 *
 * // First call executes immediately
 * throttler.maybeExecute('123');
 *
 * // Subsequent calls within 1000ms are throttled
 * throttler.maybeExecute('123'); // Throttled
 * ```
 */
export class Throttler<TFn extends AnyFunction> {
  #options: ThrottlerOptions<TFn>
  #state: ThrottlerState<TFn> = {
    isPending: false,
    executionCount: 0,
    lastArgs: undefined,
    lastExecutionTime: 0,
    nextExecutionTime: 0,
  }
  #timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    initialOptions: ThrottlerOptions<TFn>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
    }
    this.#state = {
      ...this.#state,
      ...this.#options.initialState,
    }
  }

  /**
   * Updates the throttler options
   */
  setOptions(newOptions: Partial<ThrottlerOptions<TFn>>): void {
    this.#options = { ...this.#options, ...newOptions }

    // End the pending state if the throttler is disabled
    if (!this.getEnabled()) {
      this.cancel()
    }
  }

  /**
   * Returns the current throttler options
   */
  getOptions(): Required<ThrottlerOptions<TFn>> {
    return this.#options as Required<ThrottlerOptions<TFn>>
  }

  getState(): ThrottlerState<TFn> {
    return { ...this.#state }
  }

  #setState(newState: Partial<ThrottlerState<TFn>>): void {
    this.#state = { ...this.#state, ...newState }
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
   * const throttled = new Throttler(fn, { wait: 1000 });
   *
   * // First call executes immediately
   * throttled.maybeExecute('a', 'b');
   *
   * // Call during wait period - gets throttled
   * throttled.maybeExecute('c', 'd');
   * ```
   */
  maybeExecute(...args: Parameters<TFn>): void {
    const now = Date.now()
    const timeSinceLastExecution = now - this.#state.lastExecutionTime
    const wait = this.getWait()

    // Handle leading execution
    if (this.#options.leading && timeSinceLastExecution >= wait) {
      this.#execute(...args)
    } else {
      // Store the most recent arguments for potential trailing execution
      this.#setState({
        lastArgs: args,
      })
      // Set up trailing execution if not already scheduled
      if (!this.#timeoutId && this.#options.trailing) {
        const _timeSinceLastExecution = this.#state.lastExecutionTime
          ? now - this.#state.lastExecutionTime
          : 0
        const timeoutDuration = wait - _timeSinceLastExecution
        this.#timeoutId = setTimeout(() => {
          if (this.#state.lastArgs !== undefined) {
            this.#execute(...this.#state.lastArgs)
          }
        }, timeoutDuration)
      }
    }
  }

  #execute(...args: Parameters<TFn>): void {
    if (!this.getEnabled()) return
    this.#setState({ isPending: true })
    this.fn(...args) // EXECUTE!
    const lastExecutionTime = Date.now()
    const nextExecutionTime = lastExecutionTime + this.getWait()
    this.#timeoutId = undefined
    this.#setState({
      executionCount: this.#state.executionCount + 1,
      lastExecutionTime,
      nextExecutionTime,
      isPending: false,
      lastArgs: undefined,
    })
    this.#options.onExecute?.(this)
  }

  /**
   * Cancels any pending trailing execution and clears internal state.
   *
   * If a trailing execution is scheduled (due to throttling with trailing=true),
   * this will prevent that execution from occurring. The internal timeout and
   * stored arguments will be cleared.
   *
   * Has no effect if there is no pending execution.
   */
  cancel(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = undefined
      this.#setState({
        lastArgs: undefined,
        isPending: false,
      })
    }
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
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this.#state.executionCount
  }

  /**
   * Returns `true` if there is a pending execution
   */
  getIsPending(): boolean {
    return this.#state.isPending
  }
}

/**
 * Creates a throttled function that limits how often the provided function can execute.
 *
 * Throttling ensures a function executes at most once within a specified time window,
 * regardless of how many times it is called. This is useful for rate-limiting
 * expensive operations or UI updates.
 *
 * The throttled function can be configured to execute on the leading and/or trailing
 * edge of the throttle window via options.
 *
 * For handling bursts of events, consider using debounce() instead. For hard execution
 * limits, consider using rateLimit().
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the throttler
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count and last execution time
 *
 * @example
 * ```ts
 * // Basic throttling - max once per second
 * const throttled = throttle(updateUI, { wait: 1000 });
 *
 * // Configure leading/trailing execution
 * const throttled = throttle(saveData, {
 *   wait: 2000,
 *   leading: true,  // Execute immediately on first call
 *   trailing: true  // Execute again after delay if called during wait
 * });
 * ```
 */
export function throttle<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: ThrottlerOptions<TFn>,
) {
  const throttler = new Throttler(fn, initialOptions)
  return throttler.maybeExecute.bind(throttler)
}
