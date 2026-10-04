import { observe, readSource } from '../utils/cell'
import { useDebouncedState } from './useDebouncedState'
import type { VueDebouncer, VueDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a debounced value from a reactive source. Returns the value and its utility. */
export function useDebouncedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: VuePacerOptions<VueDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, VueDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = useDebouncedState(
    readSource(source),
    options,
    selector,
  )
  observe(source, setValue)
  return [value, utility]
}
