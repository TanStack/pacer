import { Batcher } from '@tanstack/pacer/batcher'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'
import type { OctanePacerOptions } from '../types'

/** Options for useBatcher, including owner cleanup. */
export interface OctaneBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface OctaneBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & OctaneBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<OctaneBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane Batcher with reactive options and automatic owner cleanup.
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
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options?: OctanePacerOptions<OctaneBatcherOptions<TValue, TSelected>>,
  selector?: (state: BatcherState<TValue>) => TSelected,
): OctaneBatcher<TValue, TSelected>
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  ...rest: [
    options?: OctanePacerOptions<OctaneBatcherOptions<TValue, TSelected>>,
    selector?: (state: BatcherState<TValue>) => TSelected,
    slot?: symbol,
  ]
): OctaneBatcher<TValue, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneBatcherOptions<TValue, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: BatcherState<TValue>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneBatcherOptions<TValue, TSelected> = {
    ...defaults.batcher,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneBatcher<TValue, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Batcher<TValue>(fn, merged) as unknown as OctaneBatcher<
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
        instance.cancel()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
