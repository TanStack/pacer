import type { ComputedRef, Ref } from 'vue'
import { Debouncer } from '@tanstack/pacer'
import { computed, ref, unref } from 'vue'
import type { MaybeRef } from '../types'
import type { DebouncerOptions } from '@tanstack/pacer'

export interface UseDebouncerReturn<TValue> {
  /** The current debounced value */
  value: Ref<TValue>
  /** Set a new value (will be debounced) */
  setValue: (newValue: TValue) => void
  /** Force immediate update of the value */
  flush: () => void
  /** Cancel any pending updates */
  cancel: () => void
  /** Check if there are any pending updates */
  isPending: ComputedRef<boolean>
}

/**
 * Creates a debouncer instance with Vue reactivity integration.
 * This composable provides a debounced value that updates only after
 * a specified delay has passed since the last update.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebouncer } from '@tanstack/vue-pacer'
 * 
 * // Create a debouncer with an initial value and 500ms delay
 * const { value, setValue, flush, cancel, isPending } = useDebouncer('initial', {
 *   wait: 500,
 *   // Optional: execute on the leading edge (first call)
 *   leading: false,
 *   // Optional: execute on the trailing edge (after wait)
 *   trailing: true
 * })
 * 
 * // Update the value - will be debounced
 * function handleInput(event) {
 *   setValue(event.target.value)
 * }
 * 
 * // Force immediate update of current value
 * function updateNow() {
 *   flush()
 * }
 * 
 * // Cancel any pending updates
 * function cancelUpdate() {
 *   cancel()
 * }
 * </script>
 * 
 * <template>
 *   <div>
 *     <input :value="value" @input="handleInput" />
 *     <p>Current value: {{ value }}</p>
 *     <p>Update pending: {{ isPending.value }}</p>
 *     <button @click="updateNow">Update Now</button>
 *     <button @click="cancelUpdate">Cancel</button>
 *   </div>
 * </template>
 * ```
 */
export function useDebouncer<TValue>(
  initialValue: MaybeRef<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): UseDebouncerReturn<TValue> {
  const value = ref<TValue>(unref(initialValue)) as Ref<TValue>
  
  const debouncer = new Debouncer((newValue: TValue) => {
    value.value = newValue
  }, options)

  const isPending = computed(() => debouncer.getIsPending())

  return {
    value,
    setValue: (newValue: TValue) => {
      debouncer.maybeExecute(newValue)
    },
    flush: () => {
      if (value.value !== undefined) {
        // Force immediate execution by setting wait to 0
        debouncer.setOptions({ ...options, wait: 0 })
        debouncer.maybeExecute(value.value)
        debouncer.setOptions(options)
      }
    },
    cancel: () => debouncer.cancel(),
    isPending
  }
}
