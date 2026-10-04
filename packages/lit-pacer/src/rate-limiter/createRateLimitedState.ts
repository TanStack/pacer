import { createCell } from '../utils/cell'
import { createRateLimiter } from './createRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a ratelimited state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createRateLimitedState<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  initialValue: TValue,
  options: LitPacerOptions<LitRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  LitRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(host, initialValue)
  const utility = createRateLimiter(host, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
