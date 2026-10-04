import { useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useThrottler } from './useThrottler'
import type { OctaneThrottler, OctaneThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Creates throttled state with a scheduled setter.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
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
 * import { useThrottledState } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const [count, setCount, utility] = useThrottledState(0, { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count for the committed value.
 * ```
 *
 * @see useThrottler
 */
export function useThrottledState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: OctanePacerOptions<
    OctaneThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>]
export function useThrottledState<TValue, TSelected = {}>(
  initialValue: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(
    initialValue,
    subSlot(slot, 'value'),
  )
  const hook = useThrottler<SetValue<TValue>, TSelected> as (
    ...args: [
      ...Parameters<typeof useThrottler<SetValue<TValue>, TSelected>>,
      symbol,
    ]
  ) => OctaneThrottler<SetValue<TValue>, TSelected>
  const utility = hook(
    setValue,
    args[0] as OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: ThrottlerState<SetValue<TValue>>) => TSelected) | undefined,
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
