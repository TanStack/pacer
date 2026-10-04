import { createCell } from '../utils/cell'
import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter, VueRateLimiterOptions } from './useRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a ratelimited state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function useRateLimitedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: VuePacerOptions<VueRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  VueRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = useRateLimiter(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
