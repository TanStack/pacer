import { observe, readSource } from '../utils/cell.svelte'
import { createThrottledSignal } from './createThrottledSignal'
import type { SvelteThrottler, SvelteThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell.svelte'
/** Derives a throttled value from a reactive source. Returns the value and its utility. */
export function createThrottledValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<
    SvelteThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, SvelteThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createThrottledSignal(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
