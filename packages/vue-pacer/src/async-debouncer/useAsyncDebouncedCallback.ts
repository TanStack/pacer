import { useAsyncDebouncer } from './useAsyncDebouncer'
import type { VueAsyncDebouncer } from './useAsyncDebouncer'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates an async debounced version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncDebouncedCallback } from '@tanstack/vue-pacer'
 *
 * const [debouncedSearch, debouncer] = useAsyncDebouncedCallback(
 *   async (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 * </script>
 * ```
 */
export function useAsyncDebouncedCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
  selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
): [TFn, VueAsyncDebouncer<TFn, TSelected>] {
  const debouncer = useAsyncDebouncer(fn, options, selector)
  return [debouncer.maybeExecute as TFn, debouncer]
}
