import { createCell, observe, readSource } from '../utils/cell'
import { createQueuer } from './createQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineQueuer, AlpineQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/** Processes source changes in queue order and returns the last processed value. */
export function createQueuedValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<AlpineQueuerOptions<TValue, TSelected>> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [CellValue<TValue>, AlpineQueuer<TValue, TSelected>] {
  const cell = createCell(scope, readSource(source))
  const utility = createQueuer(
    scope,
    (item: TValue) => cell.set(() => item),
    options,
    selector,
  )
  observe(scope, source, (value) => utility.addItem(value))
  return [cell.value, utility]
}
