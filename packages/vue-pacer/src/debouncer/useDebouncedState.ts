import { createCell } from '../utils/cell'
import { useDebouncer } from './useDebouncer'
import type { VueDebouncer, VueDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates a debounced state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function useDebouncedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: VuePacerOptions<VueDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  VueDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = useDebouncer(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
