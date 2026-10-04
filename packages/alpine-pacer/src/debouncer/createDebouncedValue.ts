import { observe, readSource } from '../utils/cell'
import { createDebouncedState } from './createDebouncedState'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a debounced value from a reactive source. Returns the value and its utility. */
export function createDebouncedValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<
    AlpineDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createDebouncedState(
    scope,
    readSource(source),
    options,
    selector,
  )
  observe(scope, source, setValue)
  return [value, utility]
}
