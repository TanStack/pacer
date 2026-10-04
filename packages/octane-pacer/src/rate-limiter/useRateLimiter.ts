import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
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
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane RateLimiter with reactive options and automatic owner cleanup.
 *
 * Pass an options object with property getters or a factory. Only top-level properties
 * are evaluated; function-valued core options remain callbacks. Local options override
 * provider defaults. Options update the same instance, preserving pending work and counters.
 *
 * Pass a selector to subscribe to the state your UI reads. The core store remains available
 * for additional subscriptions. Cleanup uses the latest onUnmount option, or the core's
 * default cancellation/stop behavior, including aborting active asynchronous work.
 *
 * @param fn - Function executed by the utility.
 * @param options - Core options and an optional cleanup callback.
 * @param selector - Selects the state consumed by the component.
 * @returns The utility instance with reactive selected state.
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
