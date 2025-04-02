/**
 * Options for configuring a debounced function
 */
export interface DebouncerOptions {
  /**
   * Whether the debouncer is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
  /**
   * Whether to execute on the leading edge of the timeout.
   * Defaults to false.
   */
  leading?: boolean
  /**
   * Whether to execute on the trailing edge of the timeout.
   * Defaults to true.
   */
  trailing?: boolean
  /**
   * Delay in milliseconds before executing the function
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<DebouncerOptions> = {
  enabled: true,
  leading: false,
  trailing: true,
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
  private options: Required<DebouncerOptions>
  private timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    initialOptions: DebouncerOptions,
  ) {
    this.options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the debouncer options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<DebouncerOptions>,
  ): Required<DebouncerOptions> {
    this.options = {
      ...this.options,
      ...newOptions,
    }
    return this.options
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
      // Execute trailing only if enabled
      if (this.options.trailing) {
        this.executeFunction(...args)
      }
    }, this.options.wait)
  }

  private executeFunction(...args: TArgs): void {
    if (!this.options.enabled) return
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
 * This the the simple function wrapper implementation pulled from the Debouncer class. If you need
 * more control over the debouncing behavior, use the Debouncer class directly.
 *
 * If leading option is true, the function will execute immediately on the first call, then wait the delay
 * before allowing another execution.
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
  initialOptions: Omit<DebouncerOptions, 'enabled'>,
) {
  const debouncer = new Debouncer(fn, initialOptions)
  return debouncer.maybeExecute.bind(debouncer)
}
