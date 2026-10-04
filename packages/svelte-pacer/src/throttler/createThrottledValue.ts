import { observe, readSource } from '../utils/cell.svelte'
import { createThrottledSignal } from './createThrottledSignal'
import type { SvelteThrottler, SvelteThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell.svelte'
/**
 * Derives a throttled value from its current source.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() in the template. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.
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
 * import { createThrottledValue } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * let source = $state('')
 * const [value, utility] = createThrottledValue(() => source, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createThrottler
 */
export function createThrottledValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<
    SvelteThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, SvelteThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createThrottledSignal(
    readSource(source),
    options,
    selector,
  )
  observe(source, (next) => setValue(() => next))
  return [value, utility]
}
