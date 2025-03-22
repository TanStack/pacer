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
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<DebouncerOptions> = {
  leading: false,
  wait: 0,
}

/**
 * A class that creates a debounced function.
 *
 * Debouncing ensures that a function is only executed after a certain amount of time has passed
 * since its last invocation. This is useful for handling frequent events like window resizing,
 * scroll events, or input changes where you want to limit the rate of execution.
 *
 * The debounced function can be configured to execute either at the start of the delay period
 * (leading edge) or at the end (trailing edge, default). Each new call during the wait period
 * will reset the timer.
 *
 * @template TFn The type of function to debounce
 * @template TArgs The type of the function's parameters
 *
 * @example
 * ```ts
 * const debouncer = new Debouncer((value: string) => {
 *   saveToDatabase(value);
 * }, { wait: 500 });
 *
 * // Will only save after 500ms of no new input
 * inputElement.addEventListener('input', () => {
 *   debouncer.maybeExecute(inputElement.value);
 * });
 * ```
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
    options: DebouncerOptions = defaultOptions,
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
   * Attempts to execute the debounced function
   * If a call is already in progress, it will be queued
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
 * Creates a debounced function that delays invoking the provided function until after a specified wait time.
 * Multiple calls during the wait period will cancel previous pending invocations and reset the timer.
 *
 * If leading option is true, the function will execute immediately on the first call, then wait the delay
 * before allowing another execution.
 *
 * @param fn The function to debounce
 * @param options Configuration options for debouncing behavior
 * @returns A debounced version of the input function
 *
 * @example
 * ```ts
 * const debounced = debounce(() => {
 *   saveChanges();
 * }, { wait: 1000 });
 *
 * // Called repeatedly but executes at most once per second
 * inputElement.addEventListener('input', debounced);
 * ```
 */
export function debounce<TFn extends (...args: Array<any>) => any>(
  fn: TFn,
  options: DebouncerOptions,
) {
  const debouncer = new Debouncer(fn, options)
  return debouncer.maybeExecute.bind(debouncer)
}
