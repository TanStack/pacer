import { useAsyncThrottler } from './useAsyncThrottler'
import type {
  VueAsyncThrottler,
  VueAsyncThrottlerOptions,
} from './useAsyncThrottler'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback owned by the Vue lifecycle.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.
 *
 * ## State and ownership
 *
 * Use useAsyncThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncThrottledCallback } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const schedule = useAsyncThrottledCallback(async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncThrottler
 */
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncThrottlerOptions<TFn>>,
): VueAsyncThrottler<TFn>['maybeExecute'] {
  return useAsyncThrottler(fn, options).maybeExecute
}
