import { observe, readSource } from '../utils/cell'
import { useRateLimitedState } from './useRateLimitedState'
import type { VueRateLimiter, VueRateLimiterOptions } from './useRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a ratelimited value from a reactive source. Returns the value and its utility. */
export function useRateLimitedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: VuePacerOptions<VueRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, VueRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = useRateLimitedState(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
