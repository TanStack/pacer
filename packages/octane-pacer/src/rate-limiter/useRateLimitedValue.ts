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
/** Derives a ratelimited value from the current render value. */
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
