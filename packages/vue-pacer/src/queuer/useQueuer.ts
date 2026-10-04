import { Queuer } from '@tanstack/pacer/queuer'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'
import type { ShallowRef } from 'vue'
import type { VuePacerOptions } from '../types'

/** Options for useQueuer, including owner cleanup. */
export interface VueQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueQueuer<TValue, TSelected>) => void
}

/** A Queuer with framework-reactive selected state. All core methods remain available. */
export interface VueQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'options' | 'setOptions'
> {
  options: Queuer<TValue>['options'] & VueQueuerOptions<TValue, TSelected>
  setOptions: (options: Partial<VueQueuerOptions<TValue, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates a Vue Queuer with reactive options and automatic owner cleanup.
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
  options: VuePacerOptions<VueQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): VueQueuer<TValue, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueQueuerOptions<TValue, TSelected> => ({
    ...defaults().queuer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Queuer<TValue>(fn, resolve()) as unknown as VueQueuer<
    TValue,
    TSelected
  >
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.stop()
  })
}
