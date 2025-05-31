import type { Ref } from 'vue'
import { Debouncer } from '@tanstack/pacer'
import { readonly, ref, unref } from 'vue'
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
  isPending: Readonly<Ref<boolean>>
  /** Get the number of times the value has been updated */
  executionCount: Readonly<Ref<number>>
  /** Update debouncer options */
  setOptions: (
    newOptions: Partial<DebouncerOptions<(value: TValue) => void>>,
  ) => void
  /** Get current debouncer options */
  getOptions: () => Required<DebouncerOptions<(value: TValue) => void>>
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
  optionsInput: DebouncerOptions<(value: TValue) => void>,
): UseDebouncerReturn<TValue> {
  const value = ref<TValue>(unref(initialValue)) as Ref<TValue>
  const _isPending = ref(false)
  const _executionCount = ref(0)

  const getEffectiveOptions = (
    currentOpts: DebouncerOptions<(v: TValue) => void>,
  ) => {
    return {
      ...currentOpts,
      onExecute: () => {
        // Call original onExecute if it exists
        if (currentOpts.onExecute) {
          // Assuming currentOpts.onExecute expects the debouncer instance
          currentOpts.onExecute(debouncer as any) // Type assertion for now, can be refined
        }
        _isPending.value = debouncer.getIsPending() // Sync after execution
        _executionCount.value = debouncer.getExecutionCount() // Sync execution count
      },
    } as Required<DebouncerOptions<(newValue: TValue) => void>>
  }

  const debouncer = new Debouncer((newValue: TValue) => {
    value.value = newValue
  }, getEffectiveOptions(optionsInput))

  // Initialize reactive refs with initial state from debouncer
  _isPending.value = debouncer.getIsPending()
  _executionCount.value = debouncer.getExecutionCount()

  const wrappedSetValue = (newValue: TValue) => {
    debouncer.maybeExecute(newValue)
    _isPending.value = debouncer.getIsPending() // Update after trying to execute
    console.log(
      `[useDebouncer.ts] after maybeExecute, _isPending.value = ${_isPending.value}`,
    )
  }

  const wrappedCancel = () => {
    debouncer.cancel()
    _isPending.value = debouncer.getIsPending() // Update after cancelling
  }

  const wrappedFlush = () => {
    // The core debouncer doesn't have a 'pending value' to flush to.
    // It flushes by cancelling current timer and executing with last *successful* value if leading, or current *input* value for trailing.
    // The previous logic was: cancel and then maybeExecute the current `value.value`.
    if (value.value !== undefined) {
      // This is the current debounced value
      debouncer.cancel() // This sets its internal _isPending to false
      debouncer.maybeExecute(value.value) // This might make it pending again or execute immediately
    }
    _isPending.value = debouncer.getIsPending() // Sync after flush actions
  }

  const wrappedSetOptions = (
    newOptions: Partial<DebouncerOptions<(v: TValue) => void>>,
  ) => {
    const currentCoreOptions = debouncer.getOptions()
    const mergedOptions = { ...currentCoreOptions, ...newOptions }
    debouncer.setOptions(getEffectiveOptions(mergedOptions)) // Re-wrap onExecute
    _isPending.value = debouncer.getIsPending() // Sync after options change
    // Note: if `wait` changes, the existing timer isn't automatically rescheduled by core setOptions.
    // This behavior is inherited from the core debouncer.
  }

  return {
    value,
    setValue: wrappedSetValue,
    flush: wrappedFlush,
    cancel: wrappedCancel,
    isPending: readonly(_isPending),
    executionCount: readonly(_executionCount),
    setOptions: wrappedSetOptions,
    getOptions: () => debouncer.getOptions(),
  }
}
