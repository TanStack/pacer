import { Queuer } from '@tanstack/pacer/queuer'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'
import type { OctanePacerOptions } from '../types'

/** Options for useQueuer, including owner cleanup. */
export interface OctaneQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneQueuer<TValue, TSelected>) => void
}

/** A Queuer with framework-reactive selected state. All core methods remain available. */
export interface OctaneQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'options' | 'setOptions'
> {
  options: Queuer<TValue>['options'] & OctaneQueuerOptions<TValue, TSelected>
  setOptions: (options: Partial<OctaneQueuerOptions<TValue, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane Queuer with reactive options and automatic owner cleanup.
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
export function useQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): OctaneQueuer<TValue, TSelected>
export function useQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  ...rest: [
    options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
    selector?: (state: QueuerState<TValue>) => TSelected,
    slot?: symbol,
  ]
): OctaneQueuer<TValue, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneQueuerOptions<TValue, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: QueuerState<TValue>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneQueuerOptions<TValue, TSelected> = {
    ...defaults.queuer,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneQueuer<TValue, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Queuer<TValue>(fn, merged) as unknown as OctaneQueuer<
    TValue,
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
        instance.stop()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
