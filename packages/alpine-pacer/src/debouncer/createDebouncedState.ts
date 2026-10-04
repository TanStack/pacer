import { createCell } from '../utils/cell'
import { createDebouncer } from './createDebouncer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a debounced state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createDebouncedState<TValue, TSelected = {}>(
  scope: PacerScope,
  initialValue: TValue,
  options: AlpinePacerOptions<
    AlpineDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  AlpineDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(scope, initialValue)
  const utility = createDebouncer(scope, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
