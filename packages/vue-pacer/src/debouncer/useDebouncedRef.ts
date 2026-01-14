import { ref } from 'vue'
import { useDebouncer } from './useDebouncer'
import type { VueDebouncer } from './useDebouncer'
import type { Ref } from 'vue'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

/**
 * A Vue composable that creates a debounced ref value, combining Vue's ref with debouncing functionality.
 * This composable provides both the current debounced value and methods to update it.
 *
 * The ref value is only updated after the specified wait time has elapsed since the last update attempt.
 * If another update is attempted before the wait time expires, the timer resets and starts waiting again.
 * This is useful for handling frequent state updates that should be throttled, like search input values
 * or window resize dimensions.
 *
 * The composable returns a tuple containing:
 * - The current debounced value (as a readonly Ref)
 * - A function to update the debounced value
 * - The debouncer instance with additional control methods
 *
 * ## State Management and Selector
 *
 * The composable uses TanStack Store for reactive state management via the underlying debouncer instance.
 * The `selector` parameter allows you to specify which debouncer state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
 *
 * Available debouncer state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDebouncedRef } from '@tanstack/vue-pacer'
 *
 * const instantValue = ref('')
 *
 * // Default behavior - no reactive state subscriptions
 * const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedRef('', {
 *   wait: 500 // Wait 500ms after last keystroke
 * });
 *
 * // Opt-in to re-render when pending state changes
 * const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedRef(
 *   '',
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * const handleChange = (e) => {
 *   instantValue.value = e.target.value
 *   setDebouncedValue(e.target.value)
 * };
 * </script>
 *
 * <template>
 *   <input :value="instantValue" @input="handleChange" />
 *   <p>Instant: {{ instantValue }}</p>
 *   <p>Debounced: {{ debouncedValue }}</p>
 * </template>
 * ```
 */
export function useDebouncedRef<TValue, TSelected = {}>(
  value: TValue,
  options: DebouncerOptions<(value: TValue) => void>,
  selector?: (state: DebouncerState<(value: TValue) => void>) => TSelected,
): [
  Readonly<Ref<TValue>>,
  (value: TValue) => void,
  VueDebouncer<(value: TValue) => void, TSelected>,
] {
  const debouncedValue = ref(value) as Ref<TValue>
  const debouncer = useDebouncer(
    (v: TValue) => {
      debouncedValue.value = v
    },
    options,
    selector,
  )
  return [debouncedValue, debouncer.maybeExecute, debouncer]
}
