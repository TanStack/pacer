import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { createSubscribe } from '../utils/Subscribe'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { OctanePacerSubscribe } from '../utils/Subscribe'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { OctanePacerOptions } from '../types'

/** Options for useRateLimiter, including owner cleanup. */
export interface OctaneRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneRateLimiter<TFn, TSelected>) => void
}

/** A RateLimiter with framework-reactive selected state. All core methods remain available. */
export interface OctaneRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'options' | 'setOptions'> {
  options: RateLimiter<TFn>['options'] &
    OctaneRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<OctaneRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: OctanePacerSubscribe<RateLimiterState>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the RateLimiter for its Octane owner.
 *
 * Accepts at most a configured number of calls in a fixed or sliding window. Calls beyond the limit are rejected rather than queued. Use the state and timing methods to display capacity and retry timing.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state. Use utility.Subscribe with a render callback
 * to select state in a child without subscribing the owner.
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
 *
 * @example
 * ```ts
 * import { useRateLimiter } from '@tanstack/octane-pacer'
 *
 * const utility = useRateLimiter(
 *   (value: string) => { console.log(value) },
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
export function useRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: OctanePacerOptions<OctaneRateLimiterOptions<TFn, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): OctaneRateLimiter<TFn, TSelected>
export function useRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneRateLimiterOptions<TFn, TSelected>>,
    selector?: (state: RateLimiterState) => TSelected,
    slot?: symbol,
  ]
): OctaneRateLimiter<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneRateLimiterOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: RateLimiterState,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneRateLimiterOptions<TFn, TSelected> = {
    ...defaults.rateLimiter,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneRateLimiter<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new RateLimiter<TFn>(
    fn,
    merged,
  ) as unknown as OctaneRateLimiter<TFn, TSelected>
  const instance = ref.current
  if (!Object.hasOwn(instance, 'Subscribe')) {
    Object.defineProperty(instance, 'Subscribe', {
      value: createSubscribe(instance.store),
      enumerable: true,
    })
  }
  useLayoutEffect(
    () => {
      instance.fn = fn
      instance.setOptions(merged)
    },
    null,
    subSlot(slot, 'options'),
  )
  const state = select(
    instance.store,
    selector,
    { compare: shallow },
    subSlot(slot, 'state'),
  )
  Object.defineProperty(instance, 'state', {
    value: state,
    configurable: true,
    enumerable: true,
  })
  useLayoutEffect(
    () => () => {
      if (instance.options.onUnmount) instance.options.onUnmount(instance)
      else {
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
