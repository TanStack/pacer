import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface SolidAsyncBatcher<
  TValue,
  TSelected = AsyncBatcherState<TValue>,
> extends Omit<AsyncBatcher<TValue>, 'store'> {
  /**
   * Reactive state that will be updated when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Accessor<TSelected>
}

/**
 * Creates a Solid-compatible AsyncBatcher instance for managing asynchronous batches of items, exposing Solid signals for all stateful properties.
 *
 * This is the async version of the createBatcher hook. Unlike the sync version, this async batcher:
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
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
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
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncBatcher instance
 *
 * Example usage:
 * ```tsx
 * // Basic async batcher for API requests
 * const asyncBatcher = createAsyncBatcher(
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
 *
 * // Use Solid signals in your UI
 * const items = asyncBatcher.state().items;
 * const isExecuting = asyncBatcher.state().isExecuting;
 * ```
 */
export function createAsyncBatcher<
  TValue,
  TSelected = AsyncBatcherState<TValue>,
>(
  fn: (items: Array<TValue>) => Promise<any>,
  initialOptions: AsyncBatcherOptions<TValue> = {},
  selector?: (state: AsyncBatcherState<TValue>) => TSelected,
): SolidAsyncBatcher<TValue, TSelected> {
  const asyncBatcher = new AsyncBatcher<TValue>(fn, initialOptions)

  const state = useStore(asyncBatcher.store, selector)

  return {
    ...asyncBatcher,
    state,
  } as unknown as SolidAsyncBatcher<TValue, TSelected> // omit `store` in favor of `state`
}
