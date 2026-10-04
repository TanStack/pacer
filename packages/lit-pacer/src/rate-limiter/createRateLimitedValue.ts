import { observe, readSource } from '../utils/cell'
import { createRateLimitedState } from './createRateLimitedState'
import type { ReactiveControllerHost } from 'lit'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a ratelimited value from a reactive source. Returns the value and its utility. */
export function createRateLimitedValue<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  source: ValueSource<TValue>,
  options: LitPacerOptions<LitRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, LitRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createRateLimitedState(
    host,
    readSource(source),
    options,
    selector,
  )
  observe(host, source, setValue)
  return [value, utility]
}
