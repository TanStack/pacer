import { createCell } from '../utils/cell'
import { createDebouncer } from './createDebouncer'
import type { ReactiveControllerHost } from 'lit'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a debounced state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createDebouncedState<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  initialValue: TValue,
  options: LitPacerOptions<LitDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  LitDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(host, initialValue)
  const utility = createDebouncer(host, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
