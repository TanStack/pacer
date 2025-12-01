import { Batcher } from '@tanstack/pacer/batcher'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

export interface SolidBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'store'
> {
  /**
   * Reactive state that will be updated when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<BatcherState<TValue>>>
}

/**
 * Creates a Solid-compatible Batcher instance for managing batches of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Batch processing of items using the provided `fn` function
 * - Configurable batch size and wait time
 * - Custom batch processing logic via getShouldExecute
 * - Event callbacks for monitoring batch operations
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * The batcher collects items and processes them in batches based on:
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
 * - `isRunning`: Whether the batcher is currently running (not stopped)
 * - `items`: Array of items currently queued for batching
 * - `totalItemsProcessed`: Total number of individual items that have been processed across all batches
 *
 * Example usage:
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const batcher = createBatcher(
 *   (items) => {
 *     // Process batch of items
 *     console.log('Processing batch:', items);
 *   },
 *   {
 *     maxSize: 5,
 *     wait: 2000,
 *     onExecute: (batcher) => console.log('Batch executed'),
 *     getShouldExecute: (items) => items.length >= 3
 *   }
 * );
 *
 * // Opt-in to re-render when items or isRunning changes (optimized for UI updates)
 * const batcher = createBatcher(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 },
 *   (state) => ({ items: state.items, isRunning: state.isRunning })
 * );
 *
 * // Opt-in to re-render when execution metrics change (optimized for tracking progress)
 * const batcher = createBatcher(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     totalItemsProcessed: state.totalItemsProcessed
 *   })
 * );
 *
 * // Add items to batch
 * batcher.addItem('task1');
 * batcher.addItem('task2');
 *
 * // Control the batcher
 * batcher.stop();  // Pause processing
 * batcher.start(); // Resume processing
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { items, isRunning } = batcher.state();
 * ```
 */
export function createBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue> = {},
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SolidBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().batcher,
    ...options,
  } as BatcherOptions<TValue>

  const batcher = new Batcher(fn, mergedOptions)

  const state = useStore(batcher.store, selector)
  return {
    ...batcher,
    state,
  } as SolidBatcher<TValue, TSelected>
}
