import { useMemo, useState } from 'react'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { useStore } from '@tanstack/react-store'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface ReactAsyncBatcher<
  TValue,
  TSelected = AsyncBatcherState<TValue>,
> extends Omit<AsyncBatcher<TValue>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: TSelected
}

/**
 * A React hook that creates an `AsyncBatcher` instance for managing asynchronous batches of items.
 *
 * This is the async version of the useBatcher hook. Unlike the sync version, this async batcher:
 * - Handles promises and returns results from batch executions
 * - Provides error handling with configurable error behavior
 * - Tracks success, error, and settle counts separately
 * - Has state tracking for when batches are executing
 * - Returns the result of the batch function execution
 *
 * Features:
 * - Configurable batch size and wait time
 * - Custom batch processing logic via getShouldExecute
 * - Event callbacks for monitoring batch operations
 * - Error handling for failed batch operations
 * - Automatic or manual batch processing
 *
 * The batcher collects items and processes them in batches based on:
 * - Maximum batch size (number of items per batch)
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncBatcher instance
 *
 * @example
 * ```tsx
 * // Basic async batcher for API requests
 * const asyncBatcher = useAsyncBatcher(
 *   async (items) => {
 *     const results = await Promise.all(items.map(item => processItem(item)));
 *     return results;
 *   },
 *   {
 *     maxSize: 10,
 *     wait: 2000,
 *     onSuccess: (result) => {
 *       console.log('Batch processed successfully:', result);
 *     },
 *     onError: (error) => {
 *       console.error('Batch processing failed:', error);
 *     }
 *   }
 * );
 *
 * // Add items to batch
 * asyncBatcher.addItem(newItem);
 *
 * // Manually execute batch
 * const result = await asyncBatcher.execute();
 * ```
 */
export function useAsyncBatcher<TValue, TSelected = AsyncBatcherState<TValue>>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue> = {},
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): ReactAsyncBatcher<TValue, TSelected> {
  const [asyncBatcher] = useState(() => new AsyncBatcher<TValue>(fn, options))

  const state = useStore(asyncBatcher.store, selector)

  asyncBatcher.setOptions(options)

  return useMemo(
    () =>
      ({
        ...asyncBatcher,
        state,
      }) as unknown as ReactAsyncBatcher<TValue, TSelected>, // omit `store` in favor of `state`
    [asyncBatcher, state],
  )
}
