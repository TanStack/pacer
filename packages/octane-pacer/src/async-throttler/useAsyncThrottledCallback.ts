import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncThrottler } from './useAsyncThrottler'
import type {
  OctaneAsyncThrottler,
  OctaneAsyncThrottlerOptions,
} from './useAsyncThrottler'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable throttled callback owned by the Octane lifecycle.
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
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncThrottledCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useAsyncThrottledCallback(async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncThrottler
 */
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
): OctaneAsyncThrottler<TFn>['maybeExecute']
export function useAsyncThrottledCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneAsyncThrottler<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncThrottler<TFn> as (
    ...args: [...Parameters<typeof useAsyncThrottler<TFn>>, symbol]
  ) => OctaneAsyncThrottler<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncThrottlerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
