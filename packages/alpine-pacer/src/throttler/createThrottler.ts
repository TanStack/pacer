import { Throttler } from '@tanstack/pacer/throttler'
import { bindPacer } from '../utils/bindPacer'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createThrottler, including owner cleanup. */
export interface AlpineThrottlerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends ThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineThrottler<TFn, TSelected>) => void
}

/** A Throttler with framework-reactive selected state. All core methods remain available. */
export interface AlpineThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'options' | 'setOptions'> {
  options: Throttler<TFn>['options'] & AlpineThrottlerOptions<TFn, TSelected>
  setOptions: (options: Partial<AlpineThrottlerOptions<TFn, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine Throttler with reactive options and automatic owner cleanup.
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
export function createThrottler<TFn extends AnyFunction, TSelected = {}>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineThrottlerOptions<TFn, TSelected>>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): AlpineThrottler<TFn, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineThrottlerOptions<TFn, TSelected> => ({
    ...defaults().throttler,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Throttler<TFn>(
    fn,
    resolve(),
  ) as unknown as AlpineThrottler<TFn, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
