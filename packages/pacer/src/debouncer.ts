import type { AnyFunction } from './types'

/**
 * Options for configuring a debounced function
 */
export interface DebouncerOptions<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
> {
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
   * Callback function that is called after the function is executed
   */
  onExecute?: (debouncer: Debouncer<TFn, TArgs>) => void
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

const defaultOptions: Required<DebouncerOptions<any, any>> = {
  enabled: true,
  leading: false,
  trailing: true,
  wait: 0,
  onExecute: () => {},
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
export class Debouncer<TFn extends AnyFunction, TArgs extends Parameters<TFn>> {
  private canLeadingExecute = true
  private isPending = false
  private executionCount = 0
  private options: Required<DebouncerOptions<TFn, TArgs>>
  private timeoutId: NodeJS.Timeout | undefined

  constructor(
    private fn: TFn,
    initialOptions: DebouncerOptions<TFn, TArgs>,
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
    newOptions: Partial<DebouncerOptions<TFn, TArgs>>,
  ): Required<DebouncerOptions<TFn, TArgs>> {
    this.options = {
      ...this.options,
      ...newOptions,
    }

    // End the pending state if the debouncer is disabled
    if (!this.options.enabled) {
      this.isPending = false
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
   * Returns `true` if debouncing
   */
  getIsPending(): boolean {
    return this.options.enabled && this.isPending
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

    // Start pending state
    if (this.options.leading || this.options.trailing) {
      this.isPending = true
    }

    // Clear any existing timeout
    if (this.timeoutId) clearTimeout(this.timeoutId)

    // Set new timeout that will reset canLeadingExecute
    this.timeoutId = setTimeout(() => {
      this.canLeadingExecute = true
      this.isPending = false
      // Execute trailing only if enabled
      if (this.options.trailing) {
        this.executeFunction(...args)
      }
    }, this.options.wait)
  }

  private executeFunction(...args: TArgs): void {
    if (!this.options.enabled) return
    this.fn(...args) // EXECUTE!
    this.executionCount++
    this.options.onExecute(this)
  }

  /**
   * Cancels any pending execution
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.canLeadingExecute = true
      this.isPending = false
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
export function debounce<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: Omit<DebouncerOptions<TFn, Parameters<TFn>>, 'enabled'>,
) {
  const debouncer = new Debouncer(fn, initialOptions)
  return debouncer.maybeExecute.bind(debouncer)
}
