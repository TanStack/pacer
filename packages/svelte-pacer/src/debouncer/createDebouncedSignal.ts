import { createCell } from '../utils/cell.svelte'
import { createDebouncer } from './createDebouncer'
import type { SvelteDebouncer, SvelteDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell.svelte'
/**
 * Creates a debounced state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createDebouncedSignal<TValue, TSelected = {}>(
  initialValue: TValue,
  options: SveltePacerOptions<
    SvelteDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  SvelteDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = createDebouncer(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
