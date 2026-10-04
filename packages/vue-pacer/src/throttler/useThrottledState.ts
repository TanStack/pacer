import { createCell } from '../utils/cell'
import { useThrottler } from './useThrottler'
import type { VueThrottler, VueThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a throttled state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function useThrottledState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: VuePacerOptions<VueThrottlerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  VueThrottler<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = useThrottler(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
