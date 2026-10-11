import { createCell } from '../utils/cell'
import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter, VueRateLimiterOptions } from './useRateLimiter'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates rate-limited state with a scheduled setter.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns [value, setValue, utility]. The value is a readonly shallow ref; read value.value in JavaScript or bind the ref in a template. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
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
 * import { useRateLimitedState } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const [count, setCount, utility] = useRateLimitedState(0, { limit: 3, window: 1000 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count.value for the committed value.
 * ```
 *
 * @see useRateLimiter
 */
export function useRateLimitedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: VuePacerOptions<VueRateLimiterOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: RateLimiterState) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  VueRateLimiter<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = useRateLimiter(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
