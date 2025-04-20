import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
> {
  /**
   * Whether the throttler is enabled. When disabled, maybeExecute will not trigger any executions.
   * Defaults to true.
   */
  enabled?: boolean
  /**
   * Optional error handler for when the throttled function throws
   */
  onError?: (error: unknown) => void
  /**
   * Optional function to call when the throttled function is executed
   */
  onExecute?: (throttler: AsyncThrottler<TFn, TArgs>) => void
  /**
   * Time window in milliseconds during which the function can only be executed once
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<AsyncThrottlerOptions<any, any>> = {
  enabled: true,
  onError: () => {},
  onExecute: () => {},
  wait: 0,
}

/**
 * A class that creates an async throttled function.
 *
 * Throttling limits how often a function can be executed, allowing only one execution within a specified time window.
 * Unlike debouncing which resets the delay timer on each call, throttling ensures the function executes at a
 * regular interval regardless of how often it's called.
 *
 * This is useful for rate-limiting API calls, handling scroll/resize events, or any scenario where you want to
 * ensure a maximum execution frequency.
 *
 * @example
 * ```ts
 * const throttler = new AsyncThrottler(async (value: string) => {
 *   await saveToAPI(value);
 * }, { wait: 1000 });
 *
 * // Will only execute once per second no matter how often called
 * inputElement.addEventListener('input', () => {
 *   throttler.maybeExecute(inputElement.value);
 * });
 * ```
 */
export class AsyncThrottler<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
> {
  private abortController: AbortController | null = null
  private executionCount = 0
  private isExecuting = false
  private isScheduled = false
  private lastArgs: TArgs | undefined
  private lastExecutionTime = 0
  private nextExecutionTime = 0
  private options: Required<AsyncThrottlerOptions<TFn, TArgs>>

  constructor(
    private fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn, TArgs>,
  ) {
    this.options = {
      ...defaultOptions,
      ...initialOptions,
    }
  }

  /**
   * Updates the throttler options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<AsyncThrottlerOptions<TFn, TArgs>>,
  ): Required<AsyncThrottlerOptions<TFn, TArgs>> {
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
   * Returns the last execution time
   */
  getLastExecutionTime(): number {
    return this.lastExecutionTime
  }

  /**
   * Returns the next execution time
   */
  getNextExecutionTime(): number {
    return this.nextExecutionTime
  }

  /**
   * Cancels any pending execution
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    this.isScheduled = false
    this.lastArgs = undefined
  }

  /**
   * Attempts to execute the throttled function
   * If a call is already in progress, it may be blocked or queued depending on the `wait` option
   */
  async maybeExecute(...args: TArgs): Promise<void> {
    this.lastArgs = args
    if (this.isScheduled) return
    this.isScheduled = true

    this.abortController = new AbortController()
    const signal = this.abortController.signal

    try {
      while (this.isExecuting) {
        await this.delay(this.options.wait, signal)
      }

      while (Date.now() < this.nextExecutionTime) {
        await this.delay(this.nextExecutionTime - Date.now(), signal)
      }

      this.isScheduled = false
      this.isExecuting = true

      await this.executeFunction(...this.lastArgs)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Silent return on cancellation
      }
      try {
        this.options.onError(error)
      } catch {
        // Ignore errors from error handler
      }
    } finally {
      this.lastExecutionTime = Date.now()
      this.nextExecutionTime = this.lastExecutionTime + this.options.wait
      this.isExecuting = false
      this.abortController = null
    }
  }

  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          reject(new Error('AbortError'))
        },
        { once: true },
      )
    })
  }

  private async executeFunction(...args: TArgs): Promise<void> {
    if (!this.options.enabled) return
    this.executionCount++
    await this.fn(...args)
    this.options.onExecute(this)
  }
}

/**
 * Creates an async throttled function that limits how often the function can execute.
 * The throttled function will execute at most once per wait period, even if called multiple times.
 * If called while executing, it will wait until execution completes before scheduling the next call.
 *
 * @example
 * ```ts
 * const throttled = asyncThrottle(async () => {
 *   await someAsyncOperation();
 * }, { wait: 1000 });
 *
 * // This will execute at most once per second
 * await throttled();
 * await throttled(); // Waits 1 second before executing
 * ```
 */
export function asyncThrottle<
  TFn extends AnyAsyncFunction,
  TArgs extends Parameters<TFn>,
>(fn: TFn, initialOptions: Omit<AsyncThrottlerOptions<TFn, TArgs>, 'enabled'>) {
  const asyncThrottler = new AsyncThrottler(fn, initialOptions)
  return asyncThrottler.maybeExecute.bind(asyncThrottler)
}
