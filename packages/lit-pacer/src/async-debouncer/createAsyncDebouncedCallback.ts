import { createAsyncDebouncer } from './createAsyncDebouncer'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncDebouncer,
  LitAsyncDebouncerOptions,
} from './createAsyncDebouncer'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Lit lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.
 *
 * ## State and ownership
 *
 * Use createAsyncDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createAsyncDebouncedCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createAsyncDebouncedCallback(this, async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see createAsyncDebouncer
 */
export function createAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncDebouncerOptions<TFn>>,
): LitAsyncDebouncer<TFn>['maybeExecute'] {
  return createAsyncDebouncer(host, fn, options).maybeExecute
}
