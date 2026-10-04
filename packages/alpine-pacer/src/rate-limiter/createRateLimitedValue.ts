import { observe, readSource } from '../utils/cell'
import { createRateLimitedState } from './createRateLimitedState'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineRateLimiter,
  AlpineRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a ratelimited value from a reactive source. Returns the value and its utility. */
export function createRateLimitedValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<
    AlpineRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createRateLimitedState(
    scope,
    readSource(source),
    options,
    selector,
  )
  observe(scope, source, setValue)
  return [value, utility]
}
