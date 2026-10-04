import { useLayoutEffect } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncedState } from './useDebouncedState'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Derives a debounced value from its current source.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, utility]. Read the value during component rendering. Pass the current render value. The initial value is available immediately. Source changes schedule updates on the existing utility.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useDebouncedValue } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * // query is the current value from props or state.
 * const [value, utility] = useDebouncedValue(query, { wait: 500 })
 * // Bind value and use utility for controls. Read value for the committed value.
 * ```
 *
 * @see useDebouncer
 */
export function useDebouncedValue<TValue, TSelected = {}>(
  source: TValue,
  options: OctanePacerOptions<
    OctaneDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>]
export function useDebouncedValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useDebouncedState<TValue, TSelected> as (
    ...args: [
      ...Parameters<typeof useDebouncedState<TValue, TSelected>>,
      symbol,
    ]
  ) => [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>]
  const [value, , utility] = hook(
    source,
    args[0] as OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: DebouncerState<SetValue<TValue>>) => TSelected) | undefined,
    subSlot(slot, 'state'),
  )
  useLayoutEffect(
    () => {
      utility.maybeExecute(() => source)
    },
    [source],
    subSlot(slot, 'source'),
  )
  return [value, utility]
}
