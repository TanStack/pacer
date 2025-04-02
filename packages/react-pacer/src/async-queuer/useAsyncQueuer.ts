import { useRef } from 'react'
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
 * const asyncQueuer = useAsyncQueuer({
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
export function useAsyncQueuer<TValue>(
  options: AsyncQueuerOptions<TValue> = {},
) {
  const asyncQueuer = useRef<AsyncQueuer<TValue> | null>(null)

  if (!asyncQueuer.current) {
    asyncQueuer.current = new AsyncQueuer(options)
  }

  const setOptions = asyncQueuer.current.setOptions.bind(asyncQueuer.current)
  setOptions(options)

  return {
    addItem: asyncQueuer.current.addItem.bind(asyncQueuer.current),
    clear: asyncQueuer.current.clear.bind(asyncQueuer.current),
    getActiveItems: asyncQueuer.current.getActiveItems.bind(
      asyncQueuer.current,
    ),
    getAllItems: asyncQueuer.current.getAllItems.bind(asyncQueuer.current),
    getExecutionCount: asyncQueuer.current.getExecutionCount.bind(
      asyncQueuer.current,
    ),
    getNextItem: asyncQueuer.current.getNextItem.bind(asyncQueuer.current),
    getPendingItems: asyncQueuer.current.getPendingItems.bind(
      asyncQueuer.current,
    ),
    isEmpty: asyncQueuer.current.isEmpty.bind(asyncQueuer.current),
    isFull: asyncQueuer.current.isFull.bind(asyncQueuer.current),
    isIdle: asyncQueuer.current.isIdle.bind(asyncQueuer.current),
    isRunning: asyncQueuer.current.isRunning.bind(asyncQueuer.current),
    onError: asyncQueuer.current.onError.bind(asyncQueuer.current),
    onSettled: asyncQueuer.current.onSettled.bind(asyncQueuer.current),
    onSuccess: asyncQueuer.current.onSuccess.bind(asyncQueuer.current),
    onUpdate: asyncQueuer.current.onUpdate.bind(asyncQueuer.current),
    peek: asyncQueuer.current.peek.bind(asyncQueuer.current),
    reset: asyncQueuer.current.reset.bind(asyncQueuer.current),
    size: asyncQueuer.current.size.bind(asyncQueuer.current),
    start: asyncQueuer.current.start.bind(asyncQueuer.current),
    stop: asyncQueuer.current.stop.bind(asyncQueuer.current),
    throttle: asyncQueuer.current.throttle.bind(asyncQueuer.current),
    // setOptions
  }
}
