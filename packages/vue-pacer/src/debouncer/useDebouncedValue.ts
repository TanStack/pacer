import type { Ref } from 'vue'
import { unref, watch } from 'vue'
import { useDebouncer } from './useDebouncer'
import type { MaybeRefOrGetter } from '../types'
import type { DebouncerOptions } from '@tanstack/pacer'

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
 * <script setup lang="ts">
 * import { computed, ref, watch } from 'vue'
 * import { useDebouncedValue } from '@tanstack/vue-pacer'
 *
 * // Basic debouncing example
 * const searchQuery = ref('')
 * const updateCount = ref(0)
 * const lastUpdateTime = ref(Date.now())
 *
 * const { value: debouncedQuery } = useDebouncedValue(searchQuery, {
 *   wait: 500
 * })
 *
 * // Compute time since last update
 * const timeSinceUpdate = computed(() => {
 *   return Date.now() - lastUpdateTime.value
 * })
 *
 * // Watch for debounced updates
 * watch(debouncedQuery, () => {
 *   updateCount.value++
 *   lastUpdateTime.value = Date.now()
 * })
 *
 * // Advanced example with controls
 * const controlledValue = ref('')
 * const { value: debouncedControlled, ...controlledDebouncer } = useDebouncedValue(
 *   controlledValue,
 *   {
 *     wait: 1000,
 *     leading: false,  // Don't execute on first call
 *     trailing: true,  // Execute after wait period
 *   }
 * )
 * </script>
 *
 * <template>
 *   <div>
 *     <!-- Basic Example -->
 *     <div>
 *       <input v-model="searchQuery" placeholder="Type here..." />
 *       <p><strong>Instant value:</strong> {{ searchQuery }}</p>
 *       <p><strong>Debounced value:</strong> {{ debouncedQuery }}</p>
 *       <p><strong>Update count:</strong> {{ updateCount }}</p>
 *       <p><strong>Time since last update:</strong> {{ timeSinceUpdate }}ms</p>
 *     </div>
 *
 *     <!-- Advanced Example with Controls -->
 *     <div>
 *       <input v-model="controlledValue" placeholder="Type and use controls..." />
 *       <button
 *         @click="controlledDebouncer.cancel()"
 *         :disabled="!controlledDebouncer.isPending.value"
 *       >
 *         Cancel Update
 *       </button>
 *       <button
 *         @click="controlledDebouncer.flush()"
 *         :disabled="!controlledDebouncer.isPending.value"
 *       >
 *         Update Now
 *       </button>
 *       <p><strong>Status:</strong>
 *         {{ controlledDebouncer.isPending.value ? 'Update Pending...' : 'Up to date' }}
 *       </p>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useDebouncedValue<TValue>(
  inputValue: MaybeRefOrGetter<TValue>,
  options: DebouncerOptions<(value: TValue) => void>,
): {
  /** The current debounced value */
  value: Ref<TValue>
  /** Force immediate update of the value */
  flush: () => void
  /** Cancel any pending updates */
  cancel: () => void
  /** Check if there are any pending updates */
  isPending: Readonly<Ref<boolean>>
} {
  const getValue =
    typeof inputValue === 'function'
      ? (inputValue as () => TValue)
      : () => unref(inputValue)

  const {
    value: debouncedValue,
    setValue,
    flush,
    cancel,
    isPending,
  } = useDebouncer(getValue(), options)

  watch(
    getValue,
    (newValue) => {
      setValue(newValue)
    },
    { immediate: true },
  )

  return {
    value: debouncedValue,
    flush,
    cancel,
    isPending,
  }
}
