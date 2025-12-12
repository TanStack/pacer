import { useMemo, useState } from 'preact/hooks'
import { Queuer } from '@tanstack/pacer/queuer'
import { useStore } from '@tanstack/preact-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/preact-store'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface PreactQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'store'
> {
  /**
   * Reactive state that will be updated and re-rendered when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Readonly<TSelected>
  /**
   * @deprecated Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<QueuerState<TValue>>>
}

/**
 * A Preact hook that creates and manages a Queuer instance.
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
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
 * to specify which state changes will trigger a re-render, optimizing performance by preventing
 * unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
 *
 * Available state properties:
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
 * // Default behavior - no reactive state subscriptions
 * const queue = useQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 }
 * );
 *
 * // Opt-in to re-render when queue size changes (optimized for displaying queue length)
 * const queue = useQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({
 *     size: state.size,
 *     isEmpty: state.isEmpty,
 *     isFull: state.isFull
 *   })
 * );
 *
 * // Opt-in to re-render when processing state changes (optimized for loading indicators)
 * const queue = useQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({
 *     isRunning: state.isRunning,
 *     isIdle: state.isIdle,
 *     status: state.status,
 *     pendingTick: state.pendingTick
 *   })
 * );
 *
 * // Opt-in to re-render when execution metrics change (optimized for stats display)
 * const queue = useQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     expirationCount: state.expirationCount,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Example with custom state management and scheduling
 * const [items, setItems] = useState([]);
 *
 * const queue = useQueuer(
 *   (item) => console.log('Processing:', item),
 *   {
 *     started: true, // Start processing immediately
 *     wait: 1000,    // Process one item every second
 *     onItemsChange: (queue) => setItems(queue.peekAllItems()),
 *     getPriority: (item) => item.priority // Process higher priority items first
 *   }
 * );
 *
 * // Add items to process - they'll be handled automatically
 * queue.addItem('task1');
 * queue.addItem('task2');
 *
 * // Control the scheduler
 * queue.stop();  // Pause processing
 * queue.start(); // Resume processing
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { size, isRunning, executionCount } = queue.state;
 * ```
 */
export function useQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): PreactQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().queuer,
    ...options,
  } as QueuerOptions<TValue>

  const [queuer] = useState(() => new Queuer<TValue>(fn, mergedOptions))

  queuer.fn = fn
  queuer.setOptions(mergedOptions)

  const state = useStore(queuer.store, selector)

  return useMemo(
    () =>
      ({
        ...queuer,
        state,
      }) as PreactQueuer<TValue, TSelected>, // omit `store` in favor of `state`
    [queuer, state],
  )
}
