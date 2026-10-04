import { createCell, observe, readSource } from '../utils/cell.svelte'
import { createQueuer } from './createQueuer'
import type { SvelteQueuer, SvelteQueuerOptions } from './createQueuer'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { SveltePacerOptions } from '../types'
import type { CellValue, ValueSource } from '../utils/cell.svelte'
/**
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() in the template. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Call during component initialization. Component destruction removes effects and subscriptions and runs utility cleanup.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { createQueuedValue } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * let source = $state('')
 * const [value, utility] = createQueuedValue(() => source, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createQueuer
 */
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
