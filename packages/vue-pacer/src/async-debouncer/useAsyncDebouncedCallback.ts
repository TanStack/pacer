import { useAsyncDebouncer } from './useAsyncDebouncer'
import type {
  VueAsyncDebouncer,
  VueAsyncDebouncerOptions,
} from './useAsyncDebouncer'
import type { VuePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Vue lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.
 *
 * ## State and ownership
 *
 * Use useAsyncDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncDebouncedCallback } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const schedule = useAsyncDebouncedCallback(async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncDebouncer
 */
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: VuePacerOptions<VueAsyncDebouncerOptions<TFn>>,
): VueAsyncDebouncer<TFn>['maybeExecute'] {
  return useAsyncDebouncer(fn, options).maybeExecute
}
