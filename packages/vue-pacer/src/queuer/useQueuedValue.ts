import { createCell, observe, readSource } from '../utils/cell'
import { useQueuer } from './useQueuer'
import type { VueQueuer, VueQueuerOptions } from './useQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { VuePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/**
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is a readonly shallow ref; read value.value in JavaScript or bind the ref in a template. The source may be a value, a ref, or a getter. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Call during component setup or in an active effect scope. Scope disposal removes watchers and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { ref } from 'vue'
 * import { useQueuedValue } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const source = ref('')
 * const [value, utility] = useQueuedValue(source, { wait: 500 })
 * // Bind value and use utility for controls. Read value.value for the committed value.
 * ```
 *
 * @see useQueuer
 */
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
