import { ref, watch, toValue } from 'vue'
import { useDebouncer } from './useDebouncer'
import type { VueDebouncer } from './useDebouncer'
import type { Ref, MaybeRefOrGetter } from 'vue'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

/**
 * A Vue composable that creates a debounced version of a reactive value.
 * Unlike `useDebouncedRef`, this composable automatically tracks changes to the input value
 * and updates the debounced value accordingly.
 *
 * This is useful when you have an existing reactive value that you want to debounce,
 * rather than managing the debounced state yourself.
 *
 * The composable returns a tuple containing:
 * - The current debounced value (as a readonly Ref)
 * - The debouncer instance with additional control methods
 *
 * ## State Management and Selector
 *
 * The composable uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDebouncedValue } from '@tanstack/vue-pacer'
 *
 * const searchQuery = ref('')
 *
 * // Automatically debounce the search query
 * const [debouncedQuery, debouncer] = useDebouncedValue(searchQuery, {
 *   wait: 500
 * });
 *
 * // The debounced value updates automatically when searchQuery changes
 * </script>
 *
 * <template>
 *   <input v-model="searchQuery" placeholder="Search..." />
 *   <p>Instant: {{ searchQuery }}</p>
 *   <p>Debounced: {{ debouncedQuery }}</p>
 * </template>
 * ```
 */
export function useDebouncedValue<TValue, TSelected = {}>(
  value: MaybeRefOrGetter<TValue>,
  options: DebouncerOptions<(value: TValue) => void>,
  selector?: (state: DebouncerState<(value: TValue) => void>) => TSelected,
): [Readonly<Ref<TValue>>, VueDebouncer<(value: TValue) => void, TSelected>] {
  const debouncedValue = ref(toValue(value)) as Ref<TValue>
  const debouncer = useDebouncer(
    (v: TValue) => {
      debouncedValue.value = v
    },
    options,
    selector,
  )

  watch(
    () => toValue(value),
    (newValue) => {
      debouncer.maybeExecute(newValue)
    },
  )

  return [debouncedValue, debouncer]
}
