import { ref } from 'vue'
import { useQueuer } from './useQueuer'
import type { VueQueuer } from './useQueuer'
import type { Ref } from 'vue'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * A Vue composable that creates a queued ref value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQueuedRef } from '@tanstack/vue-pacer'
 *
 * const [queuedValue, setQueuedValue, queuer] = useQueuedRef('initial', {
 *   wait: 100,
 *   started: true
 * });
 * </script>
 * ```
 */
export function useQueuedRef<TValue, TSelected = {}>(
  value: TValue,
  options: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [
  Readonly<Ref<TValue>>,
  (value: TValue) => void,
  VueQueuer<TValue, TSelected>,
] {
  const queuedValue = ref(value) as Ref<TValue>
  const queuer = useQueuer<TValue, TSelected>(
    (v) => {
      queuedValue.value = v
    },
    options,
    selector,
  )
  return [queuedValue, queuer.addItem.bind(queuer), queuer]
}
