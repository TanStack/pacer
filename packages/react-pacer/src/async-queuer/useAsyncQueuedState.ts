import { useState } from 'react'
import { useAsyncQueuer } from './useAsyncQueuer'
import type {
  AsyncQueuer,
  AsyncQueuerOptions,
} from '@tanstack/pacer/async-queuer'

/**
 * A higher-level React hook that creates an `AsyncQueuer` instance with built-in state management.
 *
 * This hook combines an AsyncQueuer with React state to automatically track the queue items.
 * It returns a tuple containing:
 * - The current array of queued items as React state
 * - The queuer instance with methods to control the queue
 *
 * The queue can be configured with:
 * - Maximum concurrent operations
 * - Maximum queue size
 * - Processing function for queue items
 * - Various lifecycle callbacks
 *
 * The state will automatically update whenever items are:
 * - Added to the queue
 * - Removed from the queue
 * - Started processing
 * - Completed processing
 *
 * @example
 * ```tsx
 * // Create a queue with state management
 * const [queueItems, asyncQueuer] = useAsyncQueuedState({
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: true
 * });
 *
 * // Add items to queue - state updates automatically
 * asyncQueuer.addItem(async () => {
 *   const result = await fetchData();
 *   return result;
 * });
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Stop processing
 * asyncQueuer.stop();
 *
 * // queueItems reflects current queue state
 * const pendingCount = asyncQueuer.peekPendingItems().length;
 * ```
 */
export function useAsyncQueuedState<TValue>(
  fn: (value: TValue) => Promise<any>,
  options: AsyncQueuerOptions<TValue> = {},
): [Array<TValue>, AsyncQueuer<TValue>] {
  const [items, setItems] = useState<Array<TValue>>(options.initialItems ?? [])

  const asyncQueuer = useAsyncQueuer<TValue>(fn, {
    ...options,
    onItemsChange: (asyncQueuer) => {
      setItems(asyncQueuer.peekAllItems())
      options.onItemsChange?.(asyncQueuer)
    },
    onIsRunningChange: (queue) => {
      setItems((prev) => [...prev]) // rerender
      options.onIsRunningChange?.(queue)
    },
  })

  return [items, asyncQueuer]
}
