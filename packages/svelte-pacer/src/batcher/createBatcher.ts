import { Batcher } from '@tanstack/pacer/batcher'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'
import type { SveltePacerOptions } from '../types'

/** Options for createBatcher, including owner cleanup. */
export interface SvelteBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface SvelteBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & SvelteBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<SvelteBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Svelte Batcher with reactive options and automatic owner cleanup.
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
export function createBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: SveltePacerOptions<SvelteBatcherOptions<TValue, TSelected>> = {},
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SvelteBatcher<TValue, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteBatcherOptions<TValue, TSelected> => ({
    ...defaults().batcher,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Batcher<TValue>(
    fn,
    resolve(),
  ) as unknown as SvelteBatcher<TValue, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
