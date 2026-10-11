import { createCell } from '../utils/cell'
import { createRateLimiter } from './createRateLimiter'
import type { ReactiveControllerHost } from 'lit'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates rate-limited state with a scheduled setter.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns [value, setValue, utility]. The value is an accessor; call value() from render(). Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
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
 * import { createRateLimitedState } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const [count, setCount, utility] = createRateLimitedState(this, 0, { limit: 3, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count() for the committed value.
 * ```
 *
 * @see createRateLimiter
 */
export function createRateLimitedState<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  initialValue: TValue,
  options: LitPacerOptions<LitRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  LitRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(host, initialValue)
  const utility = createRateLimiter(host, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
