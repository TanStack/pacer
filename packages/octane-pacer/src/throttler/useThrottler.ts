import { Throttler } from '@tanstack/pacer/throttler'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { OctanePacerOptions } from '../types'

/** Options for useThrottler, including owner cleanup. */
export interface OctaneThrottlerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends ThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneThrottler<TFn, TSelected>) => void
}

/** A Throttler with framework-reactive selected state. All core methods remain available. */
export interface OctaneThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'options' | 'setOptions'> {
  options: Throttler<TFn>['options'] & OctaneThrottlerOptions<TFn, TSelected>
  setOptions: (options: Partial<OctaneThrottlerOptions<TFn, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane Throttler with reactive options and automatic owner cleanup.
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
export function useThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: OctanePacerOptions<OctaneThrottlerOptions<TFn, TSelected>>,
  selector?: (state: ThrottlerState<TFn>) => TSelected,
): OctaneThrottler<TFn, TSelected>
export function useThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneThrottlerOptions<TFn, TSelected>>,
    selector?: (state: ThrottlerState<TFn>) => TSelected,
    slot?: symbol,
  ]
): OctaneThrottler<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneThrottlerOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: ThrottlerState<TFn>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneThrottlerOptions<TFn, TSelected> = {
    ...defaults.throttler,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneThrottler<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Throttler<TFn>(fn, merged) as unknown as OctaneThrottler<
    TFn,
    TSelected
  >
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
        instance.cancel()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
