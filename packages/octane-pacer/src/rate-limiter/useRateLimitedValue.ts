import { useLayoutEffect } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useRateLimitedState } from './useRateLimitedState'
import type {
  OctaneRateLimiter,
  OctaneRateLimiterOptions,
} from './useRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/**
 * Derives a rate-limited value from its current source.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
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
 * import { useRateLimitedValue } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * // query is the current value from props or state.
 * const [value, utility] = useRateLimitedValue(query, { limit: 3, window: 1000 })
 * // Bind value and use utility for controls. Read value for the committed value.
 * ```
 *
 * @see useRateLimiter
 */
export function useRateLimitedValue<TValue, TSelected = {}>(
  source: TValue,
  options: OctanePacerOptions<
    OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [TValue, OctaneRateLimiter<SetValue<TValue>, TSelected>]
export function useRateLimitedValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: RateLimiterState) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneRateLimiter<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useRateLimitedState<TValue, TSelected> as (
    ...args: [
      ...Parameters<typeof useRateLimitedState<TValue, TSelected>>,
      symbol,
    ]
  ) => [
    TValue,
    SetValue<TValue>,
    OctaneRateLimiter<SetValue<TValue>, TSelected>,
  ]
  const [value, , utility] = hook(
    source,
    args[0] as OctanePacerOptions<
      OctaneRateLimiterOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as ((state: RateLimiterState) => TSelected) | undefined,
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
