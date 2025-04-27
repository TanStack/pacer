import { useState } from 'react'
import { Queuer } from '@tanstack/pacer/queuer'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

/**
 * A React hook that creates and manages a Queuer instance.
 *
 * This is a lower-level hook that provides direct access to the Queuer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.) by utilizing the onItemsChange callback.
 *
 * For a hook with built-in state management, see useQueuedState.
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
 *   onItemsChange: (queue) => setItems(queue.getAllItems()),
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
export function useQueuer<TValue>(
  options: QueuerOptions<TValue> = {},
): Queuer<TValue> {
  const [queuer] = useState(() =>
    bindInstanceMethods(new Queuer<TValue>(options)),
  )

  queuer.setOptions(options)

  return queuer
}
