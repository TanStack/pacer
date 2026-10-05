import { observe, readSource } from '../utils/cell'
import { createRateLimitedState } from './createRateLimitedState'
import type { PacerScope } from '../provider/PacerProvider'
import type {
  AlpineRateLimiter,
  AlpineRateLimiterOptions,
} from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/**
 * Derives a rate-limited value from its current source.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is an accessor; call value() in Alpine bindings. Pass a getter that reads reactive source state. The initial value is available immediately. Source changes schedule updates on the existing utility.
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
 * import { createRateLimitedValue } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * // source is an Alpine reactive object.
 * const [value, utility] = createRateLimitedValue(scope, () => source.query, { limit: 3, window: 1000 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<
    AlpineRateLimiterOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: RateLimiterState) => TSelected,
): [CellValue<TValue>, AlpineRateLimiter<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createRateLimitedState(
    scope,
    readSource(source),
    options,
    selector,
  )
  observe(scope, source, (next) => setValue(() => next))
  return [value, utility]
}
