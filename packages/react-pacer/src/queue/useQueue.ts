import { useRef } from 'react'
import { Queue } from '@tanstack/pacer/queue'
import type { QueueOptions } from '@tanstack/pacer/queue'

/**
 * A React hook that creates and manages a Queue instance.
 *
 * This is a lower-level hook that provides direct access to the Queue's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.) by utilizing the onUpdate callback.
 *
 * The Queue is a flexible data structure that defaults to FIFO (First In First Out) behavior
 * with optional position overrides for stack-like or double-ended operations.
 *
 * Supports priority-based ordering when a getPriority function is provided.
 * Items with higher priority values will be processed first.
 *
 * @example
 * ```tsx
 * // Basic FIFO queue
 * const queue = useQueue();
 *
 * // Add items to back of queue
 * queue.addItem('first');
 * queue.addItem('second');
 *
 * // Get items from front of queue
 * const next = queue.getNextItem(); // 'first'
 *
 * // Check queue status
 * const empty = queue.isEmpty(); // false
 * const size = queue.size(); // 1
 * ```
 */
export function useQueue<TValue>(options: QueueOptions<TValue> = {}) {
  const queue = useRef<Queue<TValue>>(null)

  if (!queue.current) {
    queue.current = new Queue(options)
  }

  const setOptions = queue.current.setOptions.bind(queue.current)
  setOptions(options)

  return {
    clear: queue.current.clear.bind(queue.current),
    getNextItem: queue.current.getNextItem.bind(queue.current),
    addItem: queue.current.addItem.bind(queue.current),
    getAllItems: queue.current.getAllItems.bind(queue.current),
    isEmpty: queue.current.isEmpty.bind(queue.current),
    isFull: queue.current.isFull.bind(queue.current),
    peek: queue.current.peek.bind(queue.current),
    size: queue.current.size.bind(queue.current),
    // setOptions
  } as const
}
