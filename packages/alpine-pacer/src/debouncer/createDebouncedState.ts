import { createCell } from '../utils/cell'
import { createDebouncer } from './createDebouncer'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell'
/**
 * Creates debounced state with a scheduled setter.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, setValue, utility]. The value is an accessor; call value() in Alpine bindings. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
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
 * import { createDebouncedState } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * const [count, setCount, utility] = createDebouncedState(scope, 0, { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count() for the committed value.
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedState<TValue, TSelected = {}>(
  scope: PacerScope,
  initialValue: TValue,
  options: AlpinePacerOptions<
    AlpineDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  AlpineDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(scope, initialValue)
  const utility = createDebouncer(scope, cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
