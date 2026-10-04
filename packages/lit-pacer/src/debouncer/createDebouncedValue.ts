import { observe, readSource } from '../utils/cell'
import { createDebouncedState } from './createDebouncedState'
import type { ReactiveControllerHost } from 'lit'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a debounced value from a reactive source. Returns the value and its utility. */
export function createDebouncedValue<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  source: ValueSource<TValue>,
  options: LitPacerOptions<LitDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, LitDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createDebouncedState(
    host,
    readSource(source),
    options,
    selector,
  )
  observe(host, source, setValue)
  return [value, utility]
}
