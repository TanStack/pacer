import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncer } from './useDebouncer'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { OctanePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback owned by the Octane lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use useDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useDebouncedCallback } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const schedule = useDebouncedCallback((value: number) => { console.log(value) }, { wait: 500 })
 * schedule(1)
 * ```
 *
 * @see useDebouncer
 */
export function useDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
): OctaneDebouncer<TFn>['maybeExecute']
export function useDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneDebouncer<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useDebouncer<TFn> as (
    ...args: [...Parameters<typeof useDebouncer<TFn>>, symbol]
  ) => OctaneDebouncer<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
