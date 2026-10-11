import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncDebouncer } from './useAsyncDebouncer'
import type {
  OctaneAsyncDebouncer,
  OctaneAsyncDebouncerOptions,
} from './useAsyncDebouncer'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Octane lifecycle.
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
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useAsyncDebouncedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useAsyncDebouncedCallback(async (value: number) => { console.log(value) }, { wait: 500 })
 * void schedule(1)
 * ```
 *
 * @see useAsyncDebouncer
 */
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
): OctaneAsyncDebouncer<TFn>['maybeExecute']
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneAsyncDebouncer<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncDebouncer<TFn> as (
    ...args: [...Parameters<typeof useAsyncDebouncer<TFn>>, symbol]
  ) => OctaneAsyncDebouncer<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
