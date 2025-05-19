import { Queuer } from '@tanstack/pacer/queuer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { QueuerOptions } from '@tanstack/pacer/queuer'

export interface SolidQueuer<TValue>
  extends Omit<
    Queuer<TValue>,
    | 'getAllItems'
    | 'getExecutionCount'
    | 'getIsEmpty'
    | 'getIsFull'
    | 'getIsIdle'
    | 'getIsRunning'
    | 'getPeek'
    | 'getSize'
  > {
  /**
   * Signal version of `getAllItems`
   */
  allItems: Accessor<Array<TValue>>
  /**
   * Signal version of `getExecutionCount`
   */
  executionCount: Accessor<number>
  /**
   * Signal version of `getIsEmpty`
   */
  isEmpty: Accessor<boolean>
  /**
   * Signal version of `getIsFull`
   */
  isFull: Accessor<boolean>
  /**
   * Signal version of `getIsIdle`
   */
  isIdle: Accessor<boolean>
  /**
   * Signal version of `getIsRunning`
   */
  isRunning: Accessor<boolean>
  /**
   * Signal version of `getPeek`
   */
  peek: Accessor<TValue | undefined>
  /**
   * Signal version of `getRejectionCount`
   */
  rejectionCount: Accessor<number>
  /**
   * Signal version of `getSize`
   */
  size: Accessor<number>
}

/**
 * Creates a Solid-compatible Queuer instance for managing a synchronous queue of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Synchronous processing of items using the provided `fn` function
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Priority queueing via `getPriority` or item `priority` property
 * - Item expiration and removal of stale items
 * - Configurable wait time between processing items
 * - Pause/resume processing
 * - Callbacks for queue state changes, execution, rejection, and expiration
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * The queue processes items synchronously in order, with optional delays between each item. When started, it will process one item per tick, with an optional wait time between ticks. You can pause and resume processing with `stop()` and `start()`.
 *
 * By default, the queue uses FIFO behavior, but you can configure LIFO or double-ended queueing by specifying the position when adding or removing items.
 *
 * Example usage:
 * ```tsx
 * // Example with Solid signals and scheduling
 * const [items, setItems] = createSignal([]);
 *
 * const queue = createQueuer(
 *   (item) => {
 *     // process item synchronously
 *     console.log('Processing', item);
 *   },
 *   {
 *     started: true, // Start processing immediately
 *     wait: 1000,    // Process one item every second
 *     onItemsChange: (queue) => setItems(queue.getAllItems()),
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
 * // Access queue state via signals
 * console.log('Items:', queue.allItems());
 * console.log('Size:', queue.size());
 * console.log('Is empty:', queue.isEmpty());
 * console.log('Is running:', queue.isRunning());
 * console.log('Next item:', queue.peek());
 * ```
 */
export function createQueuer<TValue>(
  fn: (item: TValue) => void,
  initialOptions: QueuerOptions<TValue> = {},
): SolidQueuer<TValue> {
  const queuer = bindInstanceMethods(new Queuer<TValue>(fn, initialOptions))

  const [allItems, setAllItems] = createSignal<Array<TValue>>(
    queuer.getAllItems(),
  )
  const [executionCount, setExecutionCount] = createSignal(
    queuer.getExecutionCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    queuer.getRejectionCount(),
  )
  const [isEmpty, setIsEmpty] = createSignal(queuer.getIsEmpty())
  const [isFull, setIsFull] = createSignal(queuer.getIsFull())
  const [isIdle, setIsIdle] = createSignal(queuer.getIsIdle())
  const [isRunning, setIsRunning] = createSignal(queuer.getIsRunning())
  const [peek, setPeek] = createSignal<TValue | undefined>(queuer.getPeek())
  const [size, setSize] = createSignal(queuer.getSize())

  function setOptions(newOptions: Partial<QueuerOptions<TValue>>) {
    queuer.setOptions({
      ...newOptions,
      onItemsChange: (queuer) => {
        setAllItems(queuer.getAllItems())
        setExecutionCount(queuer.getExecutionCount())
        setIsEmpty(queuer.getIsEmpty())
        setIsFull(queuer.getIsFull())
        setIsIdle(queuer.getIsIdle())
        setPeek(() => queuer.getPeek())
        setSize(queuer.getSize())

        const onItemsChange =
          newOptions.onItemsChange ?? initialOptions.onItemsChange
        onItemsChange?.(queuer)
      },
      onIsRunningChange: (queuer) => {
        setIsRunning(queuer.getIsRunning())
        setIsIdle(queuer.getIsIdle())

        const onIsRunningChange =
          newOptions.onIsRunningChange ?? initialOptions.onIsRunningChange
        onIsRunningChange?.(queuer)
      },
      onReject: (item, queuer) => {
        setRejectionCount(queuer.getRejectionCount())

        const onReject = newOptions.onReject ?? initialOptions.onReject
        onReject?.(item, queuer)
      },
    })
  }

  setOptions(initialOptions)

  return {
    ...queuer,
    allItems,
    executionCount,
    isEmpty,
    isFull,
    isIdle,
    isRunning,
    peek,
    rejectionCount,
    size,
    setOptions,
  } as SolidQueuer<TValue>
}
