import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { ShallowRef } from 'vue'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { VuePacerOptions } from '../types'

/** Options for useAsyncDebouncer, including owner cleanup. */
export interface VueAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueAsyncDebouncer<TFn, TSelected>) => void
}

/** A AsyncDebouncer with framework-reactive selected state. All core methods remain available. */
export interface VueAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'options' | 'setOptions'> {
  options: AsyncDebouncer<TFn>['options'] &
    VueAsyncDebouncerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<VueAsyncDebouncerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates a Vue AsyncDebouncer with reactive options and automatic owner cleanup.
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
export function useAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncDebouncerOptions<TFn, TSelected>>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncDebouncer<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueAsyncDebouncerOptions<TFn, TSelected> => ({
    ...defaults().asyncDebouncer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncDebouncer<TFn>(
    fn,
    resolve(),
  ) as unknown as VueAsyncDebouncer<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
