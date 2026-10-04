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
/** Creates ratelimited state with a setter and the underlying utility. */
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
