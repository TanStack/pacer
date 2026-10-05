import { observe, readSource } from '../utils/cell'
import { createDebouncedState } from './createDebouncedState'
import type { ReactiveControllerHost } from 'lit'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/**
 * Derives a debounced value from its current source.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() from render(). Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.
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
 * import { createDebouncedValue } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * // query is a reactive property on this host.
 * const [value, utility] = createDebouncedValue(this, () => this.query, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createDebouncer
 */
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
  observe(host, source, (next) => setValue(() => next))
  return [value, utility]
}
