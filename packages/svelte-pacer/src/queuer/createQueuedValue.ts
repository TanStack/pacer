import { createCell, observe, readSource } from '../utils/cell.svelte'
import { createQueuer } from './createQueuer'
import type { SvelteQueuer, SvelteQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { SveltePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell.svelte'
/** Processes source changes in queue order and returns the last processed value. */
export function createQueuedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<SvelteQueuerOptions<TValue, TSelected>> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [CellValue<TValue>, SvelteQueuer<TValue, TSelected>] {
  const cell = createCell(readSource(source))
  const utility = createQueuer(
    (item: TValue) => cell.set(() => item),
    options,
    selector,
  )
  observe(source, (value) => utility.addItem(value))
  return [cell.value, utility]
}
