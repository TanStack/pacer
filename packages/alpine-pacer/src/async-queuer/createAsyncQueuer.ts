import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { bindPacer } from '../utils/bindPacer'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createAsyncQueuer, including owner cleanup. */
export interface AlpineAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineAsyncQueuer<TValue, TSelected>) => void
}

/** A AsyncQueuer with framework-reactive selected state. All core methods remain available. */
export interface AlpineAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncQueuer<TValue>['options'] &
    AlpineAsyncQueuerOptions<TValue, TSelected>
  setOptions: (
    options: Partial<AlpineAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine AsyncQueuer with reactive options and automatic owner cleanup.
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
export function createAsyncQueuer<TValue, TSelected = {}>(
  scope: PacerScope,
  fn: (item: TValue) => Promise<any>,
  options: AlpinePacerOptions<AlpineAsyncQueuerOptions<TValue, TSelected>> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AlpineAsyncQueuer<TValue, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineAsyncQueuerOptions<TValue, TSelected> => ({
    ...defaults().asyncQueuer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncQueuer<TValue>(
    fn,
    resolve(),
  ) as unknown as AlpineAsyncQueuer<TValue, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.stop()
    instance.abort()
  })
}
