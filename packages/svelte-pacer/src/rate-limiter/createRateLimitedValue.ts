import { observe, readSource } from '../utils/cell.svelte'
import { createRateLimitedSignal } from './createRateLimitedSignal'
import type {
  SvelteRateLimiter,
  SvelteRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell.svelte'
/** Derives a ratelimited value from a reactive source. Returns the value and its utility. */
export function createRateLimitedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<
    SvelteRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createRateLimitedSignal(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
