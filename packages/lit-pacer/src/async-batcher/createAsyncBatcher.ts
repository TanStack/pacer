import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'
import type { ReactiveControllerHost } from 'lit'
import type { LitPacerOptions } from '../types'

/** Options for createAsyncBatcher, including owner cleanup. */
export interface LitAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: LitAsyncBatcher<TValue, TSelected>) => void
}

/** A AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface LitAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    LitAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<LitAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Lit AsyncBatcher with reactive options and automatic owner cleanup.
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
export function createAsyncBatcher<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  fn: (items: Array<TValue>) => Promise<any>,
  options: LitPacerOptions<LitAsyncBatcherOptions<TValue, TSelected>> = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): LitAsyncBatcher<TValue, TSelected> {
  const defaults = useDefaultPacerOptions(host)
  const resolve = (): LitAsyncBatcherOptions<TValue, TSelected> => ({
    ...defaults().asyncBatcher,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncBatcher<TValue>(
    fn,
    resolve(),
  ) as unknown as LitAsyncBatcher<TValue, TSelected>
  return bindPacer(host, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
