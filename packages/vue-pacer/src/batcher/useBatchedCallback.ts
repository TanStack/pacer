import { useBatcher } from './useBatcher'
import type { VueBatcher } from './useBatcher'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

/**
 * A Vue composable that creates a batched version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBatchedCallback } from '@tanstack/vue-pacer'
 *
 * const [addToBatch, batcher] = useBatchedCallback<string>(
 *   (items) => processBatch(items),
 *   { maxSize: 10, wait: 1000 }
 * );
 *
 * const handleAdd = () => {
 *   addToBatch('new item');
 * };
 * </script>
 * ```
 */
export function useBatchedCallback<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue>,
  selector?: (state: BatcherState<TValue>) => TSelected,
): [(item: TValue) => void, VueBatcher<TValue, TSelected>] {
  const batcher = useBatcher(fn, options, selector)
  return [batcher.addItem.bind(batcher), batcher]
}
