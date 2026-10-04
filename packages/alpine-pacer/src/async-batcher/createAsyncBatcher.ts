import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { bindPacer } from '../utils/bindPacer'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createAsyncBatcher, including owner cleanup. */
export interface AlpineAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineAsyncBatcher<TValue, TSelected>) => void
}

/** A AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface AlpineAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    AlpineAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<AlpineAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine AsyncBatcher with reactive options and automatic owner cleanup.
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
  scope: PacerScope,
  fn: (items: Array<TValue>) => Promise<any>,
  options: AlpinePacerOptions<
    AlpineAsyncBatcherOptions<TValue, TSelected>
  > = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AlpineAsyncBatcher<TValue, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineAsyncBatcherOptions<TValue, TSelected> => ({
    ...defaults().asyncBatcher,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncBatcher<TValue>(
    fn,
    resolve(),
  ) as unknown as AlpineAsyncBatcher<TValue, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
