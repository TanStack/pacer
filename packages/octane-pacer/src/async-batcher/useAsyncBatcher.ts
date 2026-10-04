import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'
import type { OctanePacerOptions } from '../types'

/** Options for useAsyncBatcher, including owner cleanup. */
export interface OctaneAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneAsyncBatcher<TValue, TSelected>) => void
}

/** A AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface OctaneAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    OctaneAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<OctaneAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Octane AsyncBatcher with reactive options and automatic owner cleanup.
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
export function useAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options?: OctanePacerOptions<OctaneAsyncBatcherOptions<TValue, TSelected>>,
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): OctaneAsyncBatcher<TValue, TSelected>
export function useAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  ...rest: [
    options?: OctanePacerOptions<OctaneAsyncBatcherOptions<TValue, TSelected>>,
    selector?: (state: AsyncBatcherState<TValue>) => TSelected,
    slot?: symbol,
  ]
): OctaneAsyncBatcher<TValue, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneAsyncBatcherOptions<TValue, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: AsyncBatcherState<TValue>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneAsyncBatcherOptions<TValue, TSelected> = {
    ...defaults.asyncBatcher,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneAsyncBatcher<TValue, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new AsyncBatcher<TValue>(
    fn,
    merged,
  ) as unknown as OctaneAsyncBatcher<TValue, TSelected>
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
        instance.abort()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
