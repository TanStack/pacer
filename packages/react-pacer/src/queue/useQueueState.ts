import { useState } from 'react'
import { useQueue } from './useQueue'
import type { QueueOptions } from '@tanstack/pacer/queue'

/**
 * A React hook that creates a queue with managed state, combining React's useState with queuing functionality.
 * This hook provides both the current queue state and queue control methods.
 *
 * The queue state is automatically updated whenever items are added, removed, or reordered in the queue.
 * All queue operations are reflected in the state array returned by the hook.
 *
 * By default uses FIFO (First In First Out) behavior, but can be configured for LIFO
 * (Last In First Out) by specifying 'front' position when adding items.
 *
 * The hook returns a tuple containing:
 * - The current queue state as an array
 * - The queue instance with methods for queue manipulation
 *
 * @template TValue The type of items stored in the queue
 * @param options Configuration options for the queue including initialItems to populate the queue,
 *                maxSize to limit queue capacity, getPriority for ordering items,
 *                and onUpdate callback for state changes
 * @returns A tuple containing the queue state array and queue instance
 *
 * @example
 * ```tsx
 * // Basic FIFO queue with state management
 * const [items, queue] = useQueueState({
 *   initialItems: ['item1', 'item2'],
 *   maxSize: 10,
 *   getPriority: (item) => item.priority
 * });
 *
 * // Add items to queue
 * const handleAdd = (item) => {
 *   queue.addItem(item);
 * };
 *
 * // Process items from queue
 * const handleProcess = () => {
 *   const nextItem = queue.getNextItem();
 *   if (nextItem) {
 *     processItem(nextItem);
 *   }
 * };
 * ```
 */

export function useQueueState<TValue>(options: QueueOptions<TValue> = {}) {
  const [state, setState] = useState<Array<TValue>>(options.initialItems || [])

  const queue = useQueue<TValue>({
    ...options,
    onUpdate: (queue) => {
      setState(queue.getAllItems())
    },
  })

  return [state, queue] as const
}
