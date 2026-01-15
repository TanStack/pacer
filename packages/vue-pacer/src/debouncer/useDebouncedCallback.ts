import { useDebouncer } from './useDebouncer'
import type { VueDebouncer } from './useDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates a debounced version of a callback function.
 *
 * Unlike `useDebouncer` which returns a debouncer instance with full control methods,
 * this composable returns just the debounced function and the debouncer instance.
 * This is useful when you only need to debounce a callback without complex state management.
 *
 * The callback will only be executed after the specified wait time has elapsed
 * since the last call. If the callback is called again before the wait time expires,
 * the timer resets and starts waiting again.
 *
 * ## State Management and Selector
 *
 * The composable uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebouncedCallback } from '@tanstack/vue-pacer'
 *
 * const [debouncedSearch, debouncer] = useDebouncedCallback(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 *
 * const handleChange = (e) => {
 *   debouncedSearch(e.target.value);
 * };
 * </script>
 * ```
 */
export function useDebouncedCallback<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: DebouncerOptions<TFn>,
  selector?: (state: DebouncerState<TFn>) => TSelected,
): [TFn, VueDebouncer<TFn, TSelected>] {
  const debouncer = useDebouncer(fn, options, selector)
  return [debouncer.maybeExecute as TFn, debouncer]
}
