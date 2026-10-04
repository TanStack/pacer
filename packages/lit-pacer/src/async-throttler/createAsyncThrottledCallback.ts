import { createAsyncThrottler } from './createAsyncThrottler'
import type { ReactiveControllerHost } from 'lit'
import type {
  LitAsyncThrottler,
  LitAsyncThrottlerOptions,
} from './createAsyncThrottler'
import type { LitPacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback owned by the Lit lifecycle.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.
 *
 * ## State and ownership
 *
 * Use createAsyncThrottler when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createAsyncThrottledCallback } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const schedule = createAsyncThrottledCallback(this, async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see createAsyncThrottler
 */
export function createAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  host: ReactiveControllerHost,
  fn: TFn,
  options: LitPacerOptions<LitAsyncThrottlerOptions<TFn>>,
): LitAsyncThrottler<TFn>['maybeExecute'] {
  return createAsyncThrottler(host, fn, options).maybeExecute
}
