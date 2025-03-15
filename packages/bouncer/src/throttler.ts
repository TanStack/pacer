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

const defaultOptions: Partial<ThrottlerOptions> = {
  leading: true,
  trailing: true,
}

/**
 * A class that creates a throttled function.
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
    options: ThrottlerOptions,
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
   * Executes the throttled function
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
   * Cancels any pending execution
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
 * Creates a throttled function that will execute the provided function after the specified delay.
 * The throttled function will execute at most once per delay period.
 *
 * @param fn - The function to throttle.
 * @param options - The options for the throttled function.
 */
export function throttle<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: ThrottlerOptions,
) {
  const throttler = new Throttler(fn, options)
  return throttler.maybeExecute.bind(throttler)
}
