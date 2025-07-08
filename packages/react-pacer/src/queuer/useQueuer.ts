import { useMemo, useState } from 'react'
import { Queuer } from '@tanstack/pacer/queuer'
import { useStore } from '@tanstack/react-store'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface ReactQueuer<TValue, TSelected = QueuerState<TValue>>
  extends Omit<Queuer<TValue>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: TSelected
}

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
 *   onItemsChange: (queue) => setItems(queue.peekAllItems()),
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
export function useQueuer<TValue, TSelected = QueuerState<TValue>>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): ReactQueuer<TValue, TSelected> {
  const [queuer] = useState(() => new Queuer<TValue>(fn, options))

  const state = useStore(queuer.store, selector)

  queuer.setOptions(options)

  return useMemo(
    () =>
      ({
        ...queuer,
        state,
      }) as unknown as ReactQueuer<TValue, TSelected>, // omit `store` in favor of `state`
    [queuer, state],
  )
}
