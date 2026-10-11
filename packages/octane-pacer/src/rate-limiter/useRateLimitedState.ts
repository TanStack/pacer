import { useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useRateLimiter } from './useRateLimiter'
import type {
  OctaneRateLimiter,
  OctaneRateLimiterOptions,
} from './useRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Creates rate-limited state with a scheduled setter.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
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
 * import { useRateLimitedState } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * const [count, setCount, utility] = useRateLimitedState(0, { limit: 3, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count for the committed value.
 * ```
 *
 * @see useRateLimiter
 */
export function useRateLimitedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: OctanePacerOptions<
    OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [TValue, SetValue<TValue>, OctaneRateLimiter<SetValue<TValue>, TSelected>]
export function useRateLimitedState<TValue, TSelected = {}>(
  initialValue: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: RateLimiterState) => TSelected,
    slot?: symbol,
  ]
): [TValue, SetValue<TValue>, OctaneRateLimiter<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(
    initialValue,
    subSlot(slot, 'value'),
  )
  const hook = useRateLimiter<SetValue<TValue>, TSelected> as (
    ...args: [
      ...Parameters<typeof useRateLimiter<SetValue<TValue>, TSelected>>,
      symbol,
    ]
  ) => OctaneRateLimiter<SetValue<TValue>, TSelected>
  const utility = hook(
    setValue,
    args[0] as OctanePacerOptions<
      OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as ((state: RateLimiterState) => TSelected) | undefined,
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
