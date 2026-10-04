import { createCell, observe, readSource } from '../utils/cell'
import { createQueuer } from './createQueuer'
import type { ReactiveControllerHost } from 'lit'
import type { LitQueuer, LitQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { LitPacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/** Processes source changes in queue order and returns the last processed value. */
export function createQueuedValue<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  source: ValueSource<TValue>,
  options: LitPacerOptions<LitQueuerOptions<TValue, TSelected>> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [CellValue<TValue>, LitQueuer<TValue, TSelected>] {
  const cell = createCell(host, readSource(source))
  const utility = createQueuer(
    host,
    (item: TValue) => cell.set(() => item),
    options,
    selector,
  )
  observe(host, source, (value) => utility.addItem(value))
  return [cell.value, utility]
}
