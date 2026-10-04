import { createCell } from '../utils/cell'
import { createDebouncer } from './createDebouncer'
import type { ReactiveControllerHost } from 'lit'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates debounced state with a scheduled setter.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
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
 * import { createDebouncedState } from '@tanstack/lit-pacer'
 *
 * // In a LitElement constructor:
 * const [count, setCount, utility] = createDebouncedState(this, 0, { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count() for the committed value.
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedState<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  initialValue: TValue,
  options: LitPacerOptions<LitDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  LitDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(host, initialValue)
  const utility = createDebouncer(host, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
