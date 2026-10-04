import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'
import type { ShallowRef } from 'vue'
import type { VuePacerOptions } from '../types'

/** Options for useAsyncQueuer, including owner cleanup. */
export interface VueAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueAsyncQueuer<TValue, TSelected>) => void
}

/** A AsyncQueuer with framework-reactive selected state. All core methods remain available. */
export interface VueAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncQueuer<TValue>['options'] &
    VueAsyncQueuerOptions<TValue, TSelected>
  setOptions: (
    options: Partial<VueAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates a Vue AsyncQueuer with reactive options and automatic owner cleanup.
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
  options: VuePacerOptions<VueAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncQueuer<TValue, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueAsyncQueuerOptions<TValue, TSelected> => ({
    ...defaults().asyncQueuer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncQueuer<TValue>(
    fn,
    resolve(),
  ) as unknown as VueAsyncQueuer<TValue, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.stop()
    instance.abort()
  })
}
