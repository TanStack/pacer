import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { ReactiveControllerHost } from 'lit'
import type { LitPacerOptions } from '../types'

/** Options for createAsyncRateLimiter, including owner cleanup. */
export interface LitAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: LitAsyncRateLimiter<TFn, TSelected>) => void
}

/** A AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface LitAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    LitAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<LitAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Lit AsyncRateLimiter with reactive options and automatic owner cleanup.
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
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncRateLimiterOptions<TFn, TSelected>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): LitAsyncRateLimiter<TFn, TSelected> {
  const defaults = useDefaultPacerOptions(host)
  const resolve = (): LitAsyncRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncRateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as LitAsyncRateLimiter<TFn, TSelected>
  return bindPacer(host, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }

    instance.abort()
  })
}
