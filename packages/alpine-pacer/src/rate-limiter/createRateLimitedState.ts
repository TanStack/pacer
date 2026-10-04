import { createCell } from '../utils/cell'
import { createRateLimiter } from './createRateLimiter'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineRateLimiter,
  AlpineRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a ratelimited state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createRateLimitedState<TValue, TSelected = {}>(
  scope: PacerScope,
  initialValue: TValue,
  options: AlpinePacerOptions<
    AlpineRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  AlpineRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(scope, initialValue)
  const utility = createRateLimiter(scope, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
