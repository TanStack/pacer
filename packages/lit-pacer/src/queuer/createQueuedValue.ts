import { createCell, observe, readSource } from '../utils/cell'
import { createQueuer } from './createQueuer'
import type { ReactiveControllerHost } from 'lit'
import type { LitQueuer, LitQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { LitPacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell'
/**
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() from render(). Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Pass the owning ReactiveControllerHost first. Host updates refresh options. Disconnecting runs cleanup; reconnecting restores subscriptions to the same utility.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedValue } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * // query is a reactive property on this host.
 * const [value, utility] = createQueuedValue(this, () => this.query, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createQueuer
 */
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
