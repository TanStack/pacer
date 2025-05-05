import type { AnyAsyncFunction } from './types'

/**
 * Options for configuring an async throttled function
 */
export interface AsyncThrottlerOptions<TFn extends AnyAsyncFunction> {
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
  onExecute?: (throttler: AsyncThrottler<TFn>) => void
  /**
   * Time window in milliseconds during which the function can only be executed once
   * Defaults to 0ms
   */
  wait: number
}

const defaultOptions: Required<AsyncThrottlerOptions<any>> = {
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
export class AsyncThrottler<TFn extends AnyAsyncFunction> {
  private _options: Required<AsyncThrottlerOptions<TFn>>
  private _abortController: AbortController | null = null
  private _executionCount = 0
  private _isExecuting = false
  private _isPending = false
  private _lastArgs: Parameters<TFn> | undefined
  private _lastExecutionTime = 0
  private _nextExecutionTime = 0

  constructor(
    private fn: TFn,
    initialOptions: AsyncThrottlerOptions<TFn>,
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
  setOptions(newOptions: Partial<AsyncThrottlerOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current options
   */
  getOptions(): Required<AsyncThrottlerOptions<TFn>> {
    return this._options
  }

  /**
   * Attempts to execute the throttled function
   * If a call is already in progress, it may be blocked or queued depending on the `wait` option
   */
  async maybeExecute(...args: Parameters<TFn>): Promise<void> {
    this._lastArgs = args
    if (this._isPending) return
    this._isPending = true

    this._abortController = new AbortController()
    const signal = this._abortController.signal

    try {
      while (this._isExecuting) {
        await this.delay(this._options.wait, signal)
      }

      while (Date.now() < this._nextExecutionTime) {
        await this.delay(this._nextExecutionTime - Date.now(), signal)
      }

      this._isPending = false
      this._isExecuting = true

      await this.executeFunction(...this._lastArgs)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Silent return on cancellation
      }
      try {
        this._options.onError(error)
      } catch {
        // Ignore errors from error handler
      }
    } finally {
      this._lastExecutionTime = Date.now()
      this._nextExecutionTime = this._lastExecutionTime + this._options.wait
      this._isExecuting = false
      this._abortController = null
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

  private async executeFunction(...args: Parameters<TFn>): Promise<void> {
    if (!this._options.enabled) return
    this._executionCount++
    await this.fn(...args)
    this._options.onExecute(this)
  }

  /**
   * Cancels any pending execution
   */
  cancel(): void {
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    this._isPending = false
    this._lastArgs = undefined
  }

  /**
   * Returns the number of times the function has been executed
   */
  getExecutionCount(): number {
    return this._executionCount
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
    return this._nextExecutionTime
  }

  /**
   * Returns the current pending state
   */
  getIsPending(): boolean {
    return this._isPending
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
export function asyncThrottle<TFn extends AnyAsyncFunction>(
  fn: TFn,
  initialOptions: Omit<AsyncThrottlerOptions<TFn>, 'enabled'>,
) {
  const asyncThrottler = new AsyncThrottler(fn, initialOptions)
  return asyncThrottler.maybeExecute.bind(asyncThrottler)
}
