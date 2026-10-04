import { observe, readSource } from '../utils/cell'
import { createThrottledState } from './createThrottledState'
import type { ReactiveControllerHost } from 'lit'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/**
 * Derives a throttled value from its current source.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
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
 * import { createThrottledValue } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * // query is a reactive property on this host.
 * const [value, utility] = createThrottledValue(this, () => this.query, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createThrottler
 */
export function createThrottledValue<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  source: ValueSource<TValue>,
  options: LitPacerOptions<LitThrottlerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, LitThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createThrottledState(
    host,
    readSource(source),
    options,
    selector,
  )
  observe(host, source, (next) => setValue(() => next))
  return [value, utility]
}
