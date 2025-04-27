import { useState } from 'react'
import { useQueuer } from './useQueuer'
import type { Queuer, QueuerOptions } from '@tanstack/pacer/queuer'

/**
 * A React hook that creates a queuer with managed state, combining React's useState with queuing functionality.
 * This hook provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
 * All queue operations are reflected in the state array returned by the hook.
 *
 * The queue can be started and stopped to automatically process items at a specified interval,
 * making it useful as a scheduler. When started, it will process one item per tick, with an
 * optional wait time between ticks.
 *
 * The hook returns a tuple containing:
 * - The current queue state as an array
 * - The queue instance with methods for queue manipulation
 *
 * @example
 * ```tsx
 * // Basic queue with initial items and priority
 * const [items, queue] = useQueuedState({
 *   initialItems: ['item1', 'item2'],
 *   started: true,
 *   wait: 1000,
 *   getPriority: (item) => item.priority
 * });
 *
 * // Add items to queue
 * const handleAdd = (item) => {
 *   queue.addItem(item);
 * };
 *
 * // Start automatic processing
 * const startProcessing = () => {
 *   queue.start();
 * };
 *
 * // Stop automatic processing
 * const stopProcessing = () => {
 *   queue.stop();
 * };
 *
 * // Manual processing still available
 * const handleProcess = () => {
 *   const nextItem = queue.getNextItem();
 *   if (nextItem) {
 *     processItem(nextItem);
 *   }
 * };
 * ```
 */
export function useQueuedState<TValue>(
  options: QueuerOptions<TValue> = {},
): [Array<TValue>, Queuer<TValue>['addItem'], Queuer<TValue>] {
  const [allItems, setAllItems] = useState<Array<TValue>>(
    options.initialItems || [],
  )

  const queue = useQueuer<TValue>({
    ...options,
    onItemsChange: (queue) => {
      setAllItems(queue.getAllItems())
      options.onItemsChange?.(queue)
    },
    onIsRunningChange: (queue) => {
      setAllItems((prev) => [...prev]) // rerender
      options.onIsRunningChange?.(queue)
    },
  })

  return [allItems, queue.addItem, queue]
}
