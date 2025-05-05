import type { ComputedRef, Ref } from 'vue'
import { unref, watch } from 'vue'
import { useDebouncer } from './useDebouncer'
import type { MaybeRefOrGetter } from '../types'
import type { DebouncerOptions } from '@tanstack/pacer'

export interface UseDebouncedValueReturn<TValue> {
  /** The current debounced value */
  value: Ref<TValue>
  /** Force immediate update of the value */
  flush: () => void
  /** Cancel any pending updates */
  cancel: () => void
  /** Check if there are any pending updates */
  isPending: ComputedRef<boolean>
}

/**
 * A Vue composable that creates a debounced value that updates only after a specified delay.
 * This composable automatically tracks changes to the input value and updates the
 * debounced value accordingly.
 *
 * The debounced value will only update after the specified wait time has elapsed since
 * the last change to the input value. If the input value changes again before the wait
 * time expires, the timer resets and starts waiting again.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useDebouncedValue } from '@tanstack/vue-pacer'
 * 
 * // Create a ref for the input value
 * const searchQuery = ref('')
 * 
 * // Create a debounced version that updates 500ms after the last change
 * const { value: debouncedQuery, isPending, flush, cancel } = useDebouncedValue(searchQuery, {
 *   wait: 500
 * })
 * 
 * // debouncedQuery will update 500ms after searchQuery stops changing
 * watch(debouncedQuery, (newValue) => {
 *   fetchSearchResults(newValue)
 * })
 * 
 * // Check if there are pending updates
 * console.log(isPending.value) // true if an update is pending
 * 
 * // Force immediate update
 * flush()
 * 
 * // Cancel pending update
 * cancel()
 * </script>
 * 
 * <template>
 *   <div>
 *     <input v-model="searchQuery" />
 *     <p>Current: {{ searchQuery }}</p>
 *     <p>Debounced: {{ debouncedQuery }}</p>
 *     <p>Pending: {{ isPending.value }}</p>
 *     <button @click="flush">Update Now</button>
 *     <button @click="cancel">Cancel</button>
 *   </div>
 * </template>
 * ```
 */
export function useDebouncedValue<TValue>(
  inputValue: MaybeRefOrGetter<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): UseDebouncedValueReturn<TValue> {
  const getValue = typeof inputValue === 'function'
    ? inputValue as () => TValue
    : () => unref(inputValue)

  const { value: debouncedValue, setValue, flush, cancel, isPending } = useDebouncer(getValue(), options)

  watch(
    getValue,
    (newValue) => {
      setValue(newValue)
    },
    { immediate: true }
  )

  return {
    value: debouncedValue,
    flush,
    cancel,
    isPending
  }
}
