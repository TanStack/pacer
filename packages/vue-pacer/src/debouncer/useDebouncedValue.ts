import { observe, readSource } from '../utils/cell'
import { useDebouncedState } from './useDebouncedState'
import type { VueDebouncer, VueDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { VuePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/**
 * Derives a debounced value from its current source.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns [value, utility]. The value is a readonly shallow ref; read value.value in JavaScript or bind the ref in a template. The source may be a value, a ref, or a getter. The initial value is available immediately. Source changes schedule updates on the existing utility.
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
 * import { ref } from 'vue'
 * import { useDebouncedValue } from '@tanstack/vue-pacer'
 *
 * // During component setup:
 * const source = ref('')
 * const [value, utility] = useDebouncedValue(source, { wait: 500 })
 * // Bind value and use utility for controls. Read value.value for the committed value.
 * ```
 *
 * @see useDebouncer
 */
export function useDebouncedValue<TValue, TSelected = {}>(
  source: ValueSource<TValue>,
  options: VuePacerOptions<VueDebouncerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, VueDebouncer<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = useDebouncedState(
    readSource(source),
    options,
    selector,
  )
  observe(source, (next) => setValue(() => next))
  return [value, utility]
}
