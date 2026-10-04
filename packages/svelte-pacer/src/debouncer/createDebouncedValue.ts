import { observe, readSource } from '../utils/cell.svelte'
import { createDebouncedSignal } from './createDebouncedSignal'
import type { SvelteDebouncer, SvelteDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell.svelte'
/** Derives a debounced value from a reactive source. Returns the value and its utility. */
export function createDebouncedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<
    SvelteDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, SvelteDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createDebouncedSignal(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
