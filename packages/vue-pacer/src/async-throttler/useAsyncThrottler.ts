import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { ShallowRef } from 'vue'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { VuePacerOptions } from '../types'

/** Options for useAsyncThrottler, including owner cleanup. */
export interface VueAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueAsyncThrottler<TFn, TSelected>) => void
}

/** A AsyncThrottler with framework-reactive selected state. All core methods remain available. */
export interface VueAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'options' | 'setOptions'> {
  options: AsyncThrottler<TFn>['options'] &
    VueAsyncThrottlerOptions<TFn, TSelected>
  setOptions: (
    options: Partial<VueAsyncThrottlerOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates a Vue AsyncThrottler with reactive options and automatic owner cleanup.
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
export function useAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncThrottlerOptions<TFn, TSelected>>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncThrottler<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueAsyncThrottlerOptions<TFn, TSelected> => ({
    ...defaults().asyncThrottler,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncThrottler<TFn>(
    fn,
    resolve(),
  ) as unknown as VueAsyncThrottler<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
