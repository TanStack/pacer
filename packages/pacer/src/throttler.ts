import type { AnyFunction } from './types'

/**
 * Options for configuring a throttled function
 */
export interface ThrottlerOptions<TFn extends AnyFunction> {
  /**
   * Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
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
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true.
   */
  trailing?: boolean
  /**
   * Time window in milliseconds during which the function can only be executed once
   */
  wait: number
}

const defaultOptions: Required<ThrottlerOptions<any>> = {
  enabled: true,
  leading: true,
  onExecute: () => {},
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
  private _executionCount = 0
  private _lastArgs: Parameters<TFn> | undefined
  private _lastExecutionTime = 0
  private _options: Required<ThrottlerOptions<TFn>>
  private _timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    initialOptions: ThrottlerOptions<TFn>,
  ) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the throttler options
   * Returns the new options state
   */
  setOptions(newOptions: Partial<ThrottlerOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }

    // End the pending state if the debouncer is disabled
    if (!this._options.enabled) {
      this.cancel()
    }
  }

  /**
   * Returns the current throttler options
   */
  getOptions(): Required<ThrottlerOptions<TFn>> {
    return this._options
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
    const timeSinceLastExecution = now - this._lastExecutionTime

    // Handle leading execution
    if (this._options.leading && timeSinceLastExecution >= this._options.wait) {
      this.executeFunction(...args)
    } else {
      // Store the most recent arguments for potential trailing execution
      this._lastArgs = args

      // Set up trailing execution if not already scheduled
      if (!this._timeoutId && this._options.trailing) {
        const _timeSinceLastExecution = this._lastExecutionTime
          ? now - this._lastExecutionTime
          : 0
        const timeoutDuration = this._options.wait - _timeSinceLastExecution
        this._timeoutId = setTimeout(() => {
          if (this._lastArgs !== undefined) {
            this.executeFunction(...this._lastArgs)
          }
        }, timeoutDuration)
      }
    }
  }

  private executeFunction(...args: Parameters<TFn>): void {
    if (!this._options.enabled) return
    this.fn(...args) // EXECUTE!
    this._executionCount++
    this._lastExecutionTime = Date.now()
    this._timeoutId = undefined
    this._lastArgs = undefined
    this._options.onExecute(this)
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
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = undefined
      this._lastArgs = undefined
    }
  }

  /**
   * Returns the last execution time
   */
  getLastExecutionTime(): number {
    return this._lastExecutionTime
  }

  /**
   * Returns the next execution time
   */
  getNextExecutionTime(): number {
    return this._lastExecutionTime + this._options.wait
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this._executionCount
  }

  /**
   * Returns `true` if there is a pending execution
   */
  getIsPending(): boolean {
    return this._options.enabled && !!this._timeoutId
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
  initialOptions: Omit<ThrottlerOptions<TFn>, 'enabled'>,
) {
  const throttler = new Throttler(fn, initialOptions)
  return throttler.maybeExecute.bind(throttler)
}
