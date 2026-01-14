import { useAsyncBatcher } from './useAsyncBatcher'
import type { VueAsyncBatcher } from './useAsyncBatcher'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

/**
 * A Vue composable that creates an async batched version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncBatchedCallback } from '@tanstack/vue-pacer'
 *
 * const [addToBatch, batcher] = useAsyncBatchedCallback<string>(
 *   async (items) => processBatch(items),
 *   { maxSize: 10, wait: 1000 }
 * );
 * </script>
 * ```
 */
export function useAsyncBatchedCallback<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue>,
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): [(item: TValue) => void, VueAsyncBatcher<TValue, TSelected>] {
  const batcher = useAsyncBatcher(fn, options, selector)
  return [batcher.addItem.bind(batcher), batcher]
}
