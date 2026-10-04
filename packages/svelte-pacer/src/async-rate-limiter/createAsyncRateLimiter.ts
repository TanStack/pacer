import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { SveltePacerOptions } from '../types'

/** Options for createAsyncRateLimiter, including owner cleanup. */
export interface SvelteAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncRateLimiterOptions<TFn> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteAsyncRateLimiter<TFn, TSelected>) => void
}

/** A AsyncRateLimiter with framework-reactive selected state. All core methods remain available. */
export interface SvelteAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'options' | 'setOptions'> {
  options: AsyncRateLimiter<TFn>['options'] &
    SvelteAsyncRateLimiterOptions<TFn, TSelected>
  setOptions: (
    options: Partial<SvelteAsyncRateLimiterOptions<TFn, TSelected>>,
  ) => void
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates a Svelte AsyncRateLimiter with reactive options and automatic owner cleanup.
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
  fn: TFn,
  options: SveltePacerOptions<SvelteAsyncRateLimiterOptions<TFn, TSelected>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): SvelteAsyncRateLimiter<TFn, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteAsyncRateLimiterOptions<TFn, TSelected> => ({
    ...defaults().asyncRateLimiter,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncRateLimiter<TFn>(
    fn,
    resolve(),
  ) as unknown as SvelteAsyncRateLimiter<TFn, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }

    instance.abort()
  })
}
