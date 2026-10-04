import { observe, readSource } from '../utils/cell'
import { useThrottledState } from './useThrottledState'
import type { VueThrottler, VueThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a throttled value from a reactive source. Returns the value and its utility. */
export function useThrottledValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: VuePacerOptions<VueThrottlerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, VueThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = useThrottledState(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
