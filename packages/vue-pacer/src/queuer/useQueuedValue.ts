import { ref, watch, toValue } from 'vue'
import { useQueuer } from './useQueuer'
import type { VueQueuer } from './useQueuer'
import type { Ref, MaybeRefOrGetter } from 'vue'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * A Vue composable that creates a queued version of a reactive value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useQueuedValue } from '@tanstack/vue-pacer'
 *
 * const inputValue = ref('')
 * const [queuedValue, queuer] = useQueuedValue(inputValue, {
 *   wait: 100,
 *   started: true
 * });
 * </script>
 * ```
 */
export function useQueuedValue<TValue, TSelected = {}>(
  value: MaybeRefOrGetter<TValue>,
  options: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [Readonly<Ref<TValue>>, VueQueuer<TValue, TSelected>] {
  const queuedValue = ref(toValue(value)) as Ref<TValue>
  const queuer = useQueuer<TValue, TSelected>(
    (v) => {
      queuedValue.value = v
    },
    options,
    selector,
  )

  watch(
    () => toValue(value),
    (newValue) => {
      queuer.addItem(newValue)
    },
  )

  return [queuedValue, queuer]
}
