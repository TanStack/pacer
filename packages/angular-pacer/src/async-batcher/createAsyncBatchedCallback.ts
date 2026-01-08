import { createAsyncBatcher } from './createAsyncBatcher'
import type { AsyncBatcherOptions } from '@tanstack/pacer/async-batcher'

/**
 * An Angular function that creates an async batched version of a callback function.
 * This function is essentially a wrapper around `createAsyncBatcher` that provides
 * a simplified API for basic async batching needs.
 *
 * The batched function will collect items and process them in batches asynchronously based on
 * the configured conditions (maxSize, wait time, etc.).
 *
 * This function provides a simpler API compared to `createAsyncBatcher`, making it ideal for basic
 * async batching needs. However, it does not expose the underlying AsyncBatcher instance.
 *
 * For advanced usage requiring features like:
 * - Manual flushing
 * - Access to batch state
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `createAsyncBatcher` function instead.
 *
 * @example
 * ```ts
 * // Batch async API calls
 * const batchApiCall = createAsyncBatchedCallback(
 *   async (items: Array<Data>) => {
 *     const response = await fetch('/api/batch', {
 *       method: 'POST',
 *       body: JSON.stringify(items)
 *     });
 *     return response.json();
 *   },
 *   { maxSize: 10, wait: 1000 }
 * );
 *
 * // Items will be batched and sent together
 * await batchApiCall(data1);
 * await batchApiCall(data2);
 * ```
 */
export function createAsyncBatchedCallback<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue>,
): (item: TValue) => Promise<void> {
  const batcher = createAsyncBatcher(fn, options)
  return (item: TValue) => batcher.addItem(item)
}

