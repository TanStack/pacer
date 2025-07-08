import { Batcher } from '@tanstack/pacer/batcher'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

export interface SolidBatcher<TValue, TSelected = BatcherState<TValue>>
  extends Omit<Batcher<TValue>, 'store'> {
  /**
   * Reactive state that will be updated when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Accessor<TSelected>
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
 * Example usage:
 * ```tsx
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
 * // Add items to batch
 * batcher.addItem('task1');
 * batcher.addItem('task2');
 *
 * // Control the batcher
 * batcher.stop();  // Pause processing
 * batcher.start(); // Resume processing
 *
 * // Access batcher state via signals
 * console.log('Items:', batcher.allItems());
 * console.log('Size:', batcher.size());
 * console.log('Is empty:', batcher.isEmpty());
 * console.log('Is running:', batcher.isRunning());
 * console.log('Batch count:', batcher.batchExecutionCount());
 * console.log('Item count:', batcher.itemExecutionCount());
 * ```
 */
export function createBatcher<TValue, TSelected = BatcherState<TValue>>(
  fn: (items: Array<TValue>) => void,
  initialOptions: BatcherOptions<TValue> = {},
  selector?: (state: BatcherState<TValue>) => TSelected,
): SolidBatcher<TValue, TSelected> {
  const batcher = new Batcher(fn, initialOptions)

  const state = useStore(batcher.store, selector)
  return {
    ...batcher,
    state,
  } as SolidBatcher<TValue, TSelected>
}
