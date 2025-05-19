import { Batcher } from '@tanstack/pacer/batcher'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { BatcherOptions } from '@tanstack/pacer/batcher'

export interface SolidBatcher<TValue>
  extends Omit<
    Batcher<TValue>,
    | 'getAllItems'
    | 'getBatchExecutionCount'
    | 'getIsEmpty'
    | 'getIsRunning'
    | 'getItemExecutionCount'
    | 'getSize'
  > {
  /**
   * Signal version of `getAllItems`
   */
  allItems: Accessor<Array<TValue>>
  /**
   * Signal version of `getBatchExecutionCount`
   */
  batchExecutionCount: Accessor<number>
  /**
   * Signal version of `getIsEmpty`
   */
  isEmpty: Accessor<boolean>
  /**
   * Signal version of `getIsRunning`
   */
  isRunning: Accessor<boolean>
  /**
   * Signal version of `getItemExecutionCount`
   */
  itemExecutionCount: Accessor<number>
  /**
   * Signal version of `getSize`
   */
  size: Accessor<number>
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
export function createBatcher<TValue>(
  fn: (items: Array<TValue>) => void,
  initialOptions: BatcherOptions<TValue> = {},
): SolidBatcher<TValue> {
  const batcher = bindInstanceMethods(new Batcher<TValue>(fn, initialOptions))

  const [allItems, setAllItems] = createSignal<Array<TValue>>(
    batcher.getAllItems(),
  )
  const [batchExecutionCount, setBatchExecutionCount] = createSignal(
    batcher.getBatchExecutionCount(),
  )
  const [itemExecutionCount, setItemExecutionCount] = createSignal(
    batcher.getItemExecutionCount(),
  )
  const [isEmpty, setIsEmpty] = createSignal(batcher.getIsEmpty())
  const [isRunning, setIsRunning] = createSignal(batcher.getIsRunning())
  const [size, setSize] = createSignal(batcher.getSize())

  function setOptions(newOptions: Partial<BatcherOptions<TValue>>) {
    batcher.setOptions({
      ...newOptions,
      onItemsChange: (batcher) => {
        setAllItems(batcher.getAllItems())
        setBatchExecutionCount(batcher.getBatchExecutionCount())
        setItemExecutionCount(batcher.getItemExecutionCount())
        setIsEmpty(batcher.getIsEmpty())
        setSize(batcher.getSize())

        const onItemsChange =
          newOptions.onItemsChange ?? initialOptions.onItemsChange
        onItemsChange?.(batcher)
      },
      onExecute: (batcher) => {
        setBatchExecutionCount(batcher.getBatchExecutionCount())
        setItemExecutionCount(batcher.getItemExecutionCount())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(batcher)
      },
      onIsRunningChange: (batcher) => {
        setIsRunning(batcher.getIsRunning())

        const onIsRunningChange =
          newOptions.onIsRunningChange ?? initialOptions.onIsRunningChange
        onIsRunningChange?.(batcher)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...batcher,
    allItems,
    batchExecutionCount,
    isEmpty,
    isRunning,
    itemExecutionCount,
    size,
    setOptions,
  } as SolidBatcher<TValue>
}
