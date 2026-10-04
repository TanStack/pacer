import { createCell } from '../utils/cell.svelte'
import { createDebouncer } from './createDebouncer'
import type { SvelteDebouncer, SvelteDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell.svelte'
/**
 * Creates debounced state with a scheduled setter.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, setValue, utility]. The value is an accessor; call value() in the template. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
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
 * import { createDebouncedSignal } from '@tanstack/svelte-pacer'
 *
 * // During component initialization:
 * const [count, setCount, utility] = createDebouncedSignal(0, { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount }),
 * )
 * setCount((previous) => previous + 1)
 * // Bind count and utility.state in the component. Read count() for the committed value.
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedSignal<TValue, TSelected = {}>(
  initialValue: TValue,
  options: SveltePacerOptions<
    SvelteDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  SvelteDebouncer<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = createDebouncer(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
