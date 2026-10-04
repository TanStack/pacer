import { createCell } from '../utils/cell'
import { createThrottler } from './createThrottler'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineThrottler, AlpineThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a throttled state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createThrottledState<TValue, TSelected = {}>(
  scope: PacerScope,
  initialValue: TValue,
  options: AlpinePacerOptions<
    AlpineThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  AlpineThrottler<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(scope, initialValue)
  const utility = createThrottler(scope, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
