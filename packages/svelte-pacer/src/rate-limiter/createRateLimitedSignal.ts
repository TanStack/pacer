import { createCell } from '../utils/cell.svelte'
import { createRateLimiter } from './createRateLimiter'
import type {
  SvelteRateLimiter,
  SvelteRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell.svelte'
/**
 * Creates a ratelimited state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createRateLimitedSignal<TValue, TSelected = {}>(
  initialValue: TValue,
  options: SveltePacerOptions<
    SvelteRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  SvelteRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = createRateLimiter(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
