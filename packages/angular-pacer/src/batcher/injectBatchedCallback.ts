import { injectBatcher } from './injectBatcher'
import type { BatcherOptions } from '@tanstack/pacer/batcher'

/**
 * An Angular function that creates a batched version of a callback function.
 * This function is essentially a wrapper around `injectBatcher` that provides
 * a simplified API for basic batching needs.
 *
 * The batched function will collect items and process them in batches based on
 * the configured conditions (maxSize, wait time, etc.).
 *
 * This function provides a simpler API compared to `injectBatcher`, making it ideal for basic
 * batching needs. However, it does not expose the underlying Batcher instance.
 *
 * For advanced usage requiring features like:
 * - Manual flushing
 * - Access to batch state
 * - State tracking
 *
 * Consider using the `injectBatcher` function instead.
 *
 * @example
 * ```ts
 * // Batch API calls
 * const batchApiCall = injectBatchedCallback(
 *   (items) => {
 *     return fetch('/api/batch', {
 *       method: 'POST',
 *       body: JSON.stringify(items)
 *     });
 *   },
 *   { maxSize: 10, wait: 1000 }
 * );
 *
 * // Items will be batched and sent together
 * batchApiCall('item1');
 * batchApiCall('item2');
 * ```
 */
export function injectBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue>,
): (item: TValue) => void {
  const batcher = injectBatcher(fn, options)
  return (item: TValue) => batcher.addItem(item)
}
