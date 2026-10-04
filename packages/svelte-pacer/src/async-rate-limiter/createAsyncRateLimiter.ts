import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { SveltePacerSubscribe } from '../utils/createSubscribe'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { SveltePacerOptions } from '../types'

/** Options for createAsyncRateLimiter, including owner cleanup. */
export interface SvelteAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteAsyncRateLimiter<TFn, TSelected>) => void
}

/** An AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface SvelteAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    SvelteAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<SvelteAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Subscribes a child snippet to state without updating the utility owner. */
  Subscribe: SveltePacerSubscribe<AsyncRateLimiterState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncRateLimiter for its Svelte owner.
 *
 * Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.
 *
 * The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
 * Use onSuccess, onError, and onSettled for execution outcomes.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state. Use utility.Subscribe with a children snippet
 * to select state in a child without updating the owner.
 *
 * Available state fields:
 *
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `isExceeded`: Whether the rate limiter has exceeded the limit
 * - `isExecuting`: Whether the rate-limited function is currently executing asynchronously
 * - `lastResult`: The result from the most recent successful function execution
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
 * - `successCount`: Number of function executions that have completed successfully
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Destroying the component calls abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { createAsyncRateLimiter } from '@tanstack/svelte-pacer'
 *
 * const utility = createAsyncRateLimiter(
 *   async (value: string) => { console.log(value) },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.executionCount
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncRateLimiterOptions<TFn, TSelected>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SvelteAsyncRateLimiter<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteAsyncRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncRateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as SvelteAsyncRateLimiter<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }

    instance.abort()
  })
}
