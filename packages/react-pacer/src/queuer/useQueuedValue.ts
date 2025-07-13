import { useEffect, useState } from 'react'
import { useQueuedState } from './useQueuedState'
import type { ReactQueuer } from './useQueuer'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

/**
 * A React hook that creates a queued value that processes state changes in order with an optional delay.
 * This hook uses useQueuer internally to manage a queue of state changes and apply them sequentially.
 *
 * The queued value will process changes in the order they are received, with optional delays between
 * processing each change. This is useful for handling state updates that need to be processed
 * in a specific order, like animations or sequential UI updates.
 *
 * The hook returns a tuple containing:
 * - The current queued value
 * - The queuer instance with control methods
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management via the underlying queuer instance.
 * The `selector` parameter allows you to specify which queuer state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, all queuer state changes will trigger a re-render.** To optimize performance, you can
 * provide a selector function that returns only the specific state values your component needs.
 * The component will only re-render when the selected values change.
 *
 * Available queuer state properties:
 * - `executionCount`: Number of items that have been processed by the queuer
 * - `expirationCount`: Number of items that have been removed due to expiration
 * - `isEmpty`: Whether the queuer has no items to process
 * - `isFull`: Whether the queuer has reached its maximum capacity
 * - `isIdle`: Whether the queuer is not currently processing any items
 * - `isRunning`: Whether the queuer is active and will process items automatically
 * - `items`: Array of items currently waiting to be processed
 * - `itemTimestamps`: Timestamps when items were added for expiration tracking
 * - `pendingTick`: Whether the queuer has a pending timeout for processing the next item
 * - `rejectionCount`: Number of items that have been rejected from being added
 * - `size`: Number of items currently in the queue
 * - `status`: Current processing status ('idle' | 'running' | 'stopped')
 *
 * @example
 * ```tsx
 * // Queue state changes with a delay between each (re-renders on any queuer state change)
 * const [value, queuer] = useQueuedValue(initialValue, {
 *   wait: 500, // Wait 500ms between processing each change
 *   started: true // Start processing immediately
 * });
 *
 * // Only re-render when queue processing state changes (optimized for loading indicators)
 * const [value, queuer] = useQueuedValue(
 *   initialValue,
 *   { wait: 500, started: true },
 *   (state) => ({
 *     isRunning: state.isRunning,
 *     isIdle: state.isIdle,
 *     status: state.status,
 *     pendingTick: state.pendingTick
 *   })
 * );
 *
 * // Only re-render when queue contents change (optimized for displaying queue status)
 * const [value, queuer] = useQueuedValue(
 *   initialValue,
 *   { wait: 500, started: true },
 *   (state) => ({
 *     size: state.size,
 *     isEmpty: state.isEmpty,
 *     isFull: state.isFull
 *   })
 * );
 *
 * // Only re-render when execution metrics change (optimized for stats display)
 * const [value, queuer] = useQueuedValue(
 *   initialValue,
 *   { wait: 500, started: true },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     expirationCount: state.expirationCount,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Add changes to the queue
 * const handleChange = (newValue) => {
 *   queuer.addItem(newValue);
 * };
 *
 * // Control the queue
 * const pauseProcessing = () => {
 *   queuer.stop();
 * };
 *
 * const resumeProcessing = () => {
 *   queuer.start();
 * };
 *
 * // Access the selected queuer state
 * const { size, isRunning, executionCount } = queuer.state;
 * ```
 */
export function useQueuedValue<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = QueuerState<TValue>,
>(
  initialValue: TValue,
  options: QueuerOptions<TValue> = {},
  selector?: (state: QueuerState<TValue>) => TSelected,
): [TValue, ReactQueuer<TValue, TSelected>] {
  const [value, setValue] = useState<TValue>(initialValue)

  const [, addItem, queuer] = useQueuedState(
    (item) => {
      setValue(item)
    },
    options,
    selector,
  )

  useEffect(() => {
    addItem(initialValue)
  }, [initialValue, addItem])

  return [value, queuer]
}
