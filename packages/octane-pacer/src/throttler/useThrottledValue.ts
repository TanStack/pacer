import { useLayoutEffect } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useThrottledState } from './useThrottledState'
import type { OctaneThrottler, OctaneThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Derives a throttled value from its current source.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
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
 * import { useThrottledValue } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * // query is the current value from props or state.
 * const [value, utility] = useThrottledValue(query, { wait: 500 })
 * // Bind value and use utility for controls. Read value for the committed value.
 * ```
 *
 * @see useThrottler
 */
export function useThrottledValue<TValue, TSelected = {}>(
  source: TValue,
  options: OctanePacerOptions<
    OctaneThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>]
export function useThrottledValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useThrottledState<TValue, TSelected> as (
    ...args: [
      ...Parameters<typeof useThrottledState<TValue, TSelected>>,
      symbol,
    ]
  ) => [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>]
  const [value, , utility] = hook(
    source,
    args[0] as OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: ThrottlerState<SetValue<TValue>>) => TSelected) | undefined,
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
