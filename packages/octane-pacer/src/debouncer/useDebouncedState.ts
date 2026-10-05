import { useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncer } from './useDebouncer'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Creates debounced state with a scheduled setter.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, setValue, utility]. Read the value during component rendering. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
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
 * import { useDebouncedState } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const [count, setCount, utility] = useDebouncedState(0, { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count for the committed value.
 * ```
 *
 * @see useDebouncer
 */
export function useDebouncedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: OctanePacerOptions<
    OctaneDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>]
export function useDebouncedState<TValue, TSelected = {}>(
  initialValue: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(
    initialValue,
    subSlot(slot, 'value'),
  )
  const hook = useDebouncer<SetValue<TValue>, TSelected> as (
    ...args: [
      ...Parameters<typeof useDebouncer<SetValue<TValue>, TSelected>>,
      symbol,
    ]
  ) => OctaneDebouncer<SetValue<TValue>, TSelected>
  const utility = hook(
    setValue,
    args[0] as OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: DebouncerState<SetValue<TValue>>) => TSelected) | undefined,
    subSlot(slot, 'utility'),
  )
  return [
    value,
    (next) => {
      utility.maybeExecute(next)
    },
    utility,
  ]
}
