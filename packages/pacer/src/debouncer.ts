/**
 * Options for configuring a debounced function
 */
export interface DebouncerOptions {
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Delay in milliseconds before executing the function
   * Defaults to 500ms
   */
  wait: number
}

const defaultOptions: Partial<DebouncerOptions> = {
  leading: false,
}

/**
 * A class that creates a debounced function.
 */
export class Debouncer<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
> {
  private canLeadingExecute = true
  private executionCount = 0
  private options: DebouncerOptions
  private timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    options: DebouncerOptions,
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
   * Executes the debounced function
   */
  maybeExecute(...args: TArgs): void {
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
      this.executeFunction(...args)
    }, this.options.wait)
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
      this.canLeadingExecute = true
    }
  }
}

/**
 * Creates a debounced function that will execute the provided function after the specified delay.
 * The debounced function will execute at most once per delay period.
 *
 * @param fn - The function to debounce.
 * @param options - The options for the debounced function.
 */
export function debounce<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: DebouncerOptions,
) {
  const debouncer = new Debouncer(fn, options)
  return debouncer.maybeExecute.bind(debouncer)
}
