import { useMemo, useState } from 'react'
import { Batcher } from '@tanstack/pacer/batcher'
import { useStore } from '@tanstack/react-store'
import type { Store } from '@tanstack/react-store'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'
import { useDefaultPacerOptions } from '../provider/PacerProvider'

export interface ReactBatcher<TValue, TSelected = {}>
  extends Omit<Batcher<TValue>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Readonly<TSelected>
  /**
   * @deprecated Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<BatcherState<TValue>>>
}

/**
 * A React hook that creates and manages a Batcher instance.
 *
 * This is a lower-level hook that provides direct access to the Batcher's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (useState, Redux, Zustand, etc.) by utilizing the onItemsChange callback.
 *
 * The Batcher collects items and processes them in batches based on configurable conditions:
 * - Maximum batch size
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
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
 * - `executionCount`: Number of batch executions that have been completed
 * - `isEmpty`: Whether the batcher has no items to process
 * - `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
 * - `isRunning`: Whether the batcher is active and will process items automatically
 * - `items`: Array of items currently queued for batch processing
 * - `size`: Number of items currently in the batch queue
 * - `status`: Current processing status ('idle' | 'pending')
 * - `totalItemsProcessed`: Total number of items processed across all batches
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 }
 * );
 *
 * // Opt-in to re-render when batch size changes (optimized for displaying queue size)
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 },
 *   (state) => ({
 *     size: state.size,
 *     isEmpty: state.isEmpty
 *   })
 * );
 *
 * // Opt-in to re-render when execution metrics change (optimized for stats display)
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     totalItemsProcessed: state.totalItemsProcessed
 *   })
 * );
 *
 * // Opt-in to re-render when processing state changes (optimized for loading indicators)
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 },
 *   (state) => ({
 *     isPending: state.isPending,
 *     isRunning: state.isRunning,
 *     status: state.status
 *   })
 * );
 *
 * // Example with custom state management and batching
 * const [items, setItems] = useState([]);
 *
 * const batcher = useBatcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   {
 *     maxSize: 5,
 *     wait: 2000,
 *     onItemsChange: (batcher) => setItems(batcher.peekAllItems()),
 *     getShouldExecute: (items) => items.length >= 3
 *   }
 * );
 *
 * // Add items to batch - they'll be processed when conditions are met
 * batcher.addItem(1);
 * batcher.addItem(2);
 * batcher.addItem(3); // Triggers batch processing
 *
 * // Control the batcher
 * batcher.stop();  // Pause batching
 * batcher.start(); // Resume batching
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { size, isPending } = batcher.state;
 * ```
 */
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue> = {},
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): ReactBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().batcher,
    ...options,
  } as BatcherOptions<TValue>

  const [batcher] = useState(() => new Batcher<TValue>(fn, mergedOptions))

  batcher.fn = fn
  batcher.setOptions(mergedOptions)

  const state = useStore(batcher.store, selector)

  return useMemo(
    () =>
      ({
        ...batcher,
        state,
      }) as ReactBatcher<TValue, TSelected>, // omit `store` in favor of `state`
    [batcher, state],
  )
}
