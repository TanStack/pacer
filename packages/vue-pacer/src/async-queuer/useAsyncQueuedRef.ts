import { ref } from 'vue'
import { useAsyncQueuer } from './useAsyncQueuer'
import type { VueAsyncQueuer } from './useAsyncQueuer'
import type { Ref } from 'vue'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

/**
 * A Vue composable that creates an async queued ref value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncQueuedRef } from '@tanstack/vue-pacer'
 *
 * const [queuedResult, addToQueue, queuer] = useAsyncQueuedRef<string, ProcessedResult>(
 *   async (item) => processItem(item),
 *   null,
 *   { concurrency: 2, started: true }
 * );
 * </script>
 * ```
 */
export function useAsyncQueuedRef<TValue, TResult, TSelected = {}>(
  fn: (value: TValue) => Promise<TResult>,
  initialValue: TResult | null = null,
  options: AsyncQueuerOptions<TValue> = {},
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): [
  Readonly<Ref<TResult | null>>,
  (value: TValue) => void,
  VueAsyncQueuer<TValue, TSelected>,
] {
  const queuedResult = ref(initialValue) as Ref<TResult | null>
  const queuer = useAsyncQueuer<TValue, TSelected>(
    async (v) => {
      const result = await fn(v)
      queuedResult.value = result
      return result
    },
    options,
    selector,
  )
  return [queuedResult, queuer.addItem.bind(queuer), queuer]
}
