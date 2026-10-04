import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'
import type { OctanePacerOptions } from '../types'

/** Options for useAsyncQueuer, including owner cleanup. */
export interface OctaneAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneAsyncQueuer<TValue, TSelected>) => void
}

/** A AsyncQueuer with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncQueuer<TValue>['options'] &
    OctaneAsyncQueuerOptions<TValue, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane AsyncQueuer with reactive options and automatic owner cleanup.
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
export function useAsyncQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => Promise<any>,
  options?: OctanePacerOptions<OctaneAsyncQueuerOptions<TValue, TSelected>>,
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): OctaneAsyncQueuer<TValue, TSelected>
export function useAsyncQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => Promise<any>,
  ...rest: [
    options?: OctanePacerOptions<OctaneAsyncQueuerOptions<TValue, TSelected>>,
    selector?: (state: AsyncQueuerState<TValue>) => TSelected,
    slot?: symbol,
  ]
): OctaneAsyncQueuer<TValue, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneAsyncQueuerOptions<TValue, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: AsyncQueuerState<TValue>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneAsyncQueuerOptions<TValue, TSelected> = {
    ...defaults.asyncQueuer,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneAsyncQueuer<TValue, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new AsyncQueuer<TValue>(
    fn,
    merged,
  ) as unknown as OctaneAsyncQueuer<TValue, TSelected>
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
        instance.abort()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
