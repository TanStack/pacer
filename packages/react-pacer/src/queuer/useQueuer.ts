import { useMemo, useState } from 'react'
import { Queuer } from '@tanstack/pacer/queuer'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

/**
 * A React hook that creates and manages a Queuer instance.
 *
 * This is a lower-level hook that provides direct access to the Queuer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.) by utilizing the onUpdate callback.
 *
 * For a hook with built-in state management, see useQueuerState.
 *
 * The Queuer extends the base Queue to add processing capabilities. Items are processed
 * synchronously in order, with optional delays between processing each item. The queuer includes
 * an internal tick mechanism that can be started and stopped, making it useful as a scheduler.
 * When started, it will process one item per tick, with an optional wait time between ticks.
 *
 * By default uses FIFO (First In First Out) behavior, but can be configured for LIFO
 * (Last In First Out) by specifying 'front' position when adding items.
 *
 * @example
 * ```tsx
 * // Example with custom state management and scheduling
 * const [items, setItems] = useState([]);
 *
 * const queue = useQueuer({
 *   started: true, // Start processing immediately
 *   wait: 1000,    // Process one item every second
 *   onUpdate: (queue) => setItems(queue.getAllItems()),
 *   getPriority: (item) => item.priority // Process higher priority items first
 * });
 *
 * // Add items to process - they'll be handled automatically
 * queue.addItem('task1');
 * queue.addItem('task2');
 *
 * // Control the scheduler
 * queue.stop();  // Pause processing
 * queue.start(); // Resume processing
 * ```
 */
export function useQueuer<TValue>(options: QueuerOptions<TValue> = {}) {
  const [queuer] = useState(() => new Queuer<TValue>(options))

  const setOptions = useMemo(() => queuer.setOptions.bind(queuer), [queuer])

  setOptions(options)

  return useMemo(
    () =>
      ({
        addItem: queuer.addItem.bind(queuer),
        clear: queuer.clear.bind(queuer),
        getAllItems: queuer.getAllItems.bind(queuer),
        getExecutionCount: queuer.getExecutionCount.bind(queuer),
        getNextItem: queuer.getNextItem.bind(queuer),
        isEmpty: queuer.isEmpty.bind(queuer),
        isFull: queuer.isFull.bind(queuer),
        isRunning: queuer.isRunning.bind(queuer),
        isIdle: queuer.isIdle.bind(queuer),
        onUpdate: queuer.onUpdate.bind(queuer),
        peek: queuer.peek.bind(queuer),
        reset: queuer.reset.bind(queuer),
        size: queuer.size.bind(queuer),
        start: queuer.start.bind(queuer),
        stop: queuer.stop.bind(queuer),
      }) as const,
    [queuer],
  )
}
