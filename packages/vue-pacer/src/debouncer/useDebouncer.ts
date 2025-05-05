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
 * <script setup lang="ts">
 * import { computed, ref } from 'vue'
 * import { useDebouncer } from '@tanstack/vue-pacer'
 * 
 * // Create a debouncer with initial value and options
 * const { value, setValue, flush, cancel, isPending } = useDebouncer('', {
 *   wait: 1000,
 *   leading: false,   // Don't execute on first call
 *   trailing: true,   // Execute after wait period
 * })
 * 
 * // Track time since last update
 * const lastUpdateTime = ref(Date.now())
 * const timeSinceUpdate = computed(() => {
 *   return Date.now() - lastUpdateTime.value
 * })
 * 
 * // Update handlers
 * function handleInput(event: Event) {
 *   const input = event.target as HTMLInputElement
 *   setValue(input.value)
 * }
 * 
 * function updateNow() {
 *   if (value.value !== undefined) {
 *     flush()
 *     lastUpdateTime.value = Date.now()
 *   }
 * }
 * 
 * function cancelUpdate() {
 *   cancel()
 * }
 * </script>
 * 
 * <template>
 *   <div>
 *     <div class="input-group">
 *       <label>Debounced input:</label>
 *       <input 
 *         :value="value"
 *         @input="handleInput"
 *         placeholder="Type here..."
 *       />
 *     </div>
 * 
 *     <div class="controls">
 *       <button 
 *         @click="cancelUpdate"
 *         :disabled="!isPending.value"
 *       >
 *         Cancel Update
 *       </button>
 *       <button 
 *         @click="updateNow"
 *         :disabled="!isPending.value"
 *       >
 *         Update Now
 *       </button>
 *     </div>
 * 
 *     <div class="values">
 *       <p><strong>Current value:</strong> {{ value }}</p>
 *       <p><strong>Status:</strong> 
 *         {{ isPending.value ? 'Update Pending...' : 'Up to date' }}
 *       </p>
 *       <p><strong>Time since update:</strong> {{ timeSinceUpdate }}ms</p>
 *     </div>
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
