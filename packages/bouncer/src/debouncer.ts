/**
 * Options for configuring a debounced function
 */
export interface DebouncerOptions {
  /**
   * Delay in milliseconds before executing the function
   */
  wait: number
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true. Setting to false will only let functions execute on the leading edge if `leading` is also set to true.
   */
  trailing?: boolean
}

/**
 * A class that creates a debounced function.
 */
export class Debouncer<T extends (...args: Array<any>) => any> {
  private canLeadingExecute = true
  private executionCount = 0
  private options: DebouncerOptions
  private timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: T,
    options: DebouncerOptions,
  ) {
    this.options = {
      leading: false,
      trailing: true,
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
   * Executes the debounced function
   */
  execute(...args: Parameters<T>): void {
    // Handle leading execution
    if (this.options.leading && this.canLeadingExecute) {
      this.executeFunction(...args)
      this.canLeadingExecute = false
    }

    // Clear any existing timeout
    if (this.timeoutId) clearTimeout(this.timeoutId)

    // Set new timeout that will reset canLeadingExecute
    this.timeoutId = setTimeout(() => {
      this.canLeadingExecute = true
      if (this.options.trailing) {
        this.executeFunction(...args)
      }
    }, this.options.wait)
  }

  private executeFunction(...args: Parameters<T>): void {
    this.executionCount++
    this.fn(...args)
  }

  /**
   * Cancels any pending execution
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.canLeadingExecute = true
    }
  }
}
