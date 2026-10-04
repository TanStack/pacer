import { Debouncer } from '@tanstack/pacer/debouncer'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'

/** Options for useDebouncer, including owner cleanup. */
export interface OctaneDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneDebouncer<TFn, TSelected>) => void
}

/** A Debouncer with framework-reactive selected state. All core methods remain available. */
export interface OctaneDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'options' | 'setOptions'> {
  options: Debouncer<TFn>['options'] & OctaneDebouncerOptions<TFn, TSelected>
  setOptions: (options: Partial<OctaneDebouncerOptions<TFn, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane Debouncer with reactive options and automatic owner cleanup.
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
export function useDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: OctanePacerOptions<OctaneDebouncerOptions<TFn, TSelected>>,
  selector?: (state: DebouncerState<TFn>) => TSelected,
): OctaneDebouncer<TFn, TSelected>
export function useDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneDebouncerOptions<TFn, TSelected>>,
    selector?: (state: DebouncerState<TFn>) => TSelected,
    slot?: symbol,
  ]
): OctaneDebouncer<TFn, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneDebouncerOptions<TFn, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: DebouncerState<TFn>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneDebouncerOptions<TFn, TSelected> = {
    ...defaults.debouncer,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneDebouncer<TFn, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Debouncer<TFn>(fn, merged) as unknown as OctaneDebouncer<
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
