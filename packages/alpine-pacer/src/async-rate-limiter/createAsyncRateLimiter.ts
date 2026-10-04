import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { bindPacer } from '../utils/bindPacer'
import type { AlpinePacerSubscribe } from '../utils/subscribe'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createAsyncRateLimiter, including owner cleanup. */
export interface AlpineAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineAsyncRateLimiter<TFn, TSelected>) => void
}

/** An AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface AlpineAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    AlpineAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<AlpineAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Subscribes a child owner to selected state with automatic cleanup. */
  subscribe: AlpinePacerSubscribe<AsyncRateLimiterState<TFn>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncRateLimiter for its Alpine owner.
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
 * Use utility.subscribe(childScope, selector) for a child subscription. It returns a getter
 * and cleans up with the child without canceling the parent utility.
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
 * Destroying the owning scope calls abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { createAsyncRateLimiter } from '@tanstack/alpine-pacer'
 *
 * const utility = createAsyncRateLimiter(
 *   scope, async (value: string) => { console.log(value) },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.executionCount
 * ```
 *
 * @param scope - Owner of option updates, subscriptions, and cleanup.
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineAsyncRateLimiterOptions<TFn, TSelected>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): AlpineAsyncRateLimiter<TFn, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineAsyncRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncRateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as AlpineAsyncRateLimiter<TFn, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }

    instance.abort()
  })
}
