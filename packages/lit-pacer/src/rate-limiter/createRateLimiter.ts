import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { LitPacerSubscribe } from '../utils/subscribe'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { ReactiveControllerHost } from 'lit'
import type { LitPacerOptions } from '../types'

/** Options for createRateLimiter, including owner cleanup. */
export interface LitRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: LitRateLimiter<TFn, TSelected>) => void
}

/** A RateLimiter with framework-reactive selected state. All core methods remain available. */
export interface LitRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'options' | 'setOptions'> {
  options: RateLimiter<TFn>['options'] & LitRateLimiterOptions<TFn, TSelected>
  setOptions: (options: Partial<LitRateLimiterOptions<TFn, TSelected>>) => void
  /** Subscribes a child owner to selected state with automatic cleanup. */
  subscribe: LitPacerSubscribe<RateLimiterState>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the RateLimiter for its Lit owner.
 *
 * Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Use utility.subscribe(childHost, selector) for a child subscription. It returns a getter
 * and cleans up with the child without canceling the parent utility.
 *
 * Available state fields:
 *
 * - `executionCount`: Number of function executions that have been completed
 * - `executionTimes`: Array of timestamps when executions occurred for rate limiting calculations
 * - `isExceeded`: Whether the rate limiter has exceeded the limit
 * - `maybeExecuteCount`: Number of times maybeExecute has been called (for reduction calculations)
 * - `rejectionCount`: Number of function executions that have been rejected due to rate limiting
 * - `status`: Current execution status - 'disabled' when not active, 'executing' when executing, 'idle' when not executing, 'exceeded' when rate limit is exceeded
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * The synchronous rate limiter has no pending timer to cancel during teardown.
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 * Reconnecting the host refreshes options and restores subscriptions to the same instance.
 *
 * @example
 * ```ts
 * import { createRateLimiter } from '@tanstack/lit-pacer'
 *
 * const utility = createRateLimiter(
 *   this, (value: string) => { console.log(value) },
 *   { limit: 5, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * utility.maybeExecute('item')
 * // Selected state: utility.state.executionCount
 * ```
 *
 * @param host - Owner of option updates, subscriptions, and cleanup.
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function createRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitRateLimiterOptions<TFn, TSelected>>,
  selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
): LitRateLimiter<TFn, TSelected> {
  const defaults = useDefaultPacerOptions(host)
  const resolve = (): LitRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().rateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new RateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as LitRateLimiter<TFn, TSelected>
  return bindPacer(host, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
  })
}
