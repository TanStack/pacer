import { createCell, observe, readSource } from '../utils/cell'
import { useQueuer } from './useQueuer'
import type { VueQueuer, VueQueuerOptions } from './useQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { VuePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/** Processes source changes in queue order and returns the last processed value. */
export function useQueuedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: VuePacerOptions<VueQueuerOptions<TValue, TSelected>> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [CellValue<TValue>, VueQueuer<TValue, TSelected>] {
  const cell = createCell(readSource(source))
  const utility = useQueuer(
    (item: TValue) => cell.set(() => item),
    options,
    selector,
  )
  observe(source, (value) => utility.addItem(value))
  return [cell.value, utility]
}
