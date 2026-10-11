import { createCell, observe, readSource } from '../utils/cell'
import { createQueuer } from './createQueuer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineQueuer, AlpineQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/**
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() in Alpine bindings. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Pass the owning PacerScope first, or call the method on that scope. Destroy the scope in the Alpine component's destroy method.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedValue } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * // source is an Alpine reactive object.
 * const [value, utility] = createQueuedValue(scope, () => source.query, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createQueuer
 */
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
