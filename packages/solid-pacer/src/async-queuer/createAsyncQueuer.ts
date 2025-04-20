import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

/**
 * A lower-level React hook that creates an `AsyncQueuer` instance for managing an async queue of items.
 *
 * This hook provides a flexible, state-management agnostic way to handle queued async operations.
 * It returns a queuer instance with methods to add items, control queue execution, and monitor queue state.
 *
 * The queue can be configured with:
 * - Maximum concurrent operations
 * - Maximum queue size
 * - Processing function for queue items
 * - Various lifecycle callbacks
 *
 * The hook returns an object containing methods to:
 * - Add/remove items from the queue
 * - Start/stop queue processing
 * - Get queue status and items
 * - Register event handlers
 * - Control execution throttling
 *
 * @example
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = createAsyncQueuer({
 *   initialItems: [],
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: false,
 * });
 *
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Monitor queue state
 * const isPending = !asyncQueuer.isIdle();
 * const itemCount = asyncQueuer.size();
 *
 * // Handle results
 * asyncQueuer.onSuccess((result) => {
 *   console.log('Item processed:', result);
 * });
 *
 * asyncQueuer.onError((error) => {
 *   console.error('Processing failed:', error);
 * });
 * ```
 */
export function createAsyncQueuer<TValue>(
  options: AsyncQueuerOptions<TValue> = {},
) {
  return new AsyncQueuer(options)
}
