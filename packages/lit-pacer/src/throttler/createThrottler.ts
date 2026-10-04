import { Throttler } from '@tanstack/pacer/throttler'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { ReactiveControllerHost } from 'lit'
import type { LitPacerOptions } from '../types'

/** Options for createThrottler, including owner cleanup. */
export interface LitThrottlerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends ThrottlerOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: LitThrottler<TFn, TSelected>) => void
}

/** A Throttler with framework-reactive selected state. All core methods remain available. */
export interface LitThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'options' | 'setOptions'> {
  options: Throttler<TFn>['options'] & LitThrottlerOptions<TFn, TSelected>
  setOptions: (options: Partial<LitThrottlerOptions<TFn, TSelected>>) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Lit Throttler with reactive options and automatic owner cleanup.
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
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitThrottlerOptions<TFn, TSelected>>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): LitThrottler<TFn, TSelected> {
  const defaults = useDefaultPacerOptions(host)
  const resolve = (): LitThrottlerOptions<TFn, TSelected> => ({
    ...defaults().throttler,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Throttler<TFn>(fn, resolve()) as unknown as LitThrottler<
    TFn,
    TSelected
  >
  return bindPacer(host, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
