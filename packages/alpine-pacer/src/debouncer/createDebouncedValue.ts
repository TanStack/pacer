import { observe, readSource } from '../utils/cell'
import { createDebouncedState } from './createDebouncedState'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineDebouncer, AlpineDebouncerOptions } from './createDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/**
 * Derives a debounced value from its current source.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
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
 * import { createDebouncedValue } from '@tanstack/alpine-pacer'
 *
 * // scope belongs to the current Alpine component.
 * // source is an Alpine reactive object.
 * const [value, utility] = createDebouncedValue(scope, () => source.query, { wait: 500 })
 * // Bind value and use utility for controls. Read value() for the committed value.
 * ```
 *
 * @see createDebouncer
 */
export function createDebouncedValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<
    AlpineDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, AlpineDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createDebouncedState(
    scope,
    readSource(source),
    options,
    selector,
  )
  observe(scope, source, (next) => setValue(() => next))
  return [value, utility]
}
