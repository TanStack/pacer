import { createCell } from '../utils/cell'
import { createThrottler } from './createThrottler'
import type { ReactiveControllerHost } from 'lit'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a throttled state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createThrottledState<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  initialValue: TValue,
  options: LitPacerOptions<LitThrottlerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  LitThrottler<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(host, initialValue)
  const utility = createThrottler(host, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
