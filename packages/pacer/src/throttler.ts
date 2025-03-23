/**
 * Options for configuring a throttled function
 */
export interface ThrottlerOptions {
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to true.
   */
  leading?: boolean
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

const defaultOptions: Required<ThrottlerOptions> = {
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
 * For rate limiting or hard API limits, consider using RateLimiter instead.
 * For collapsing rapid-fire events, consider using Debouncer.
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
export class Throttler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
  private executionCount = 0
  private lastArgs: TArgs | undefined
  private lastExecutionTime = 0
  private options: ThrottlerOptions
  private timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    options: ThrottlerOptions = defaultOptions,
  ) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this.executionCount
  }

  /**
   * Returns the last execution time
   */
  getLastExecutionTime(): number {
    return this.lastExecutionTime
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
  maybeExecute(...args: TArgs): void {
    const now = Date.now()
    const timeSinceLastExecution = now - this.lastExecutionTime

    // Handle leading execution
    if (timeSinceLastExecution >= this.options.wait) {
      if (this.options.leading) {
        this.executeFunction(...args)
      }
      this.lastExecutionTime = now
    } else {
      // Store the most recent arguments for potential trailing execution
      this.lastArgs = args

      // Set up trailing execution if not already scheduled
      if (!this.timeoutId && this.options.trailing) {
        this.timeoutId = setTimeout(() => {
          if (this.lastArgs) {
            this.executeFunction(...this.lastArgs)
            this.lastArgs = undefined
          }
          this.lastExecutionTime = Date.now()
          this.timeoutId = undefined
        }, this.options.wait - timeSinceLastExecution)
      }
    }
  }

  private executeFunction(...args: TArgs): void {
    this.executionCount++
    this.fn(...args)
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
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.lastArgs = undefined
    }
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
export function throttle<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: ThrottlerOptions,
) {
  const throttler = new Throttler(fn, options)
  return throttler.maybeExecute.bind(throttler)
}
