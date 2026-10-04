import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { bindPacer } from '../utils/bindPacer'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createRateLimiter, including owner cleanup. */
export interface AlpineRateLimiterOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends RateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineRateLimiter<TFn, TSelected>) => void
}

/** A RateLimiter with framework-reactive selected state. All core methods remain available. */
export interface AlpineRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'options' | 'setOptions'> {
  options: RateLimiter<TFn>['options'] &
    AlpineRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<AlpineRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates an Alpine RateLimiter with reactive options and automatic owner cleanup.
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
export function createRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  scope: PacerScope,
  fn: TFn,
  options: AlpinePacerOptions<AlpineRateLimiterOptions<TFn, TSelected>>,
  selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
): AlpineRateLimiter<TFn, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().rateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new RateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as AlpineRateLimiter<TFn, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
  })
}
