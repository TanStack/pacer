import { observe, readSource } from '../utils/cell.svelte'
import { createRateLimitedSignal } from './createRateLimitedSignal'
import type {
  SvelteRateLimiter,
  SvelteRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell.svelte'
/**
 * Derives a rate-limited value from its current source.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
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
 * import { createRateLimitedValue } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * let source = $state('')
 * const [value, utility] = createRateLimitedValue(() => source, { limit: 3, window: 1000 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: SveltePacerOptions<
    SvelteRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, SvelteRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createRateLimitedSignal(
    readSource(source),
    options,
    selector,
  )
  observe(source, (next) => setValue(() => next))
  return [value, utility]
}
