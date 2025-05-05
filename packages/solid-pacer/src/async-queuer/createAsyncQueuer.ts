import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuer<TValue>
  extends Omit<
    AsyncQueuer<TValue>,
    | 'getActiveItems'
    | 'getAllItems'
    | 'getExecutionCount'
    | 'getIsEmpty'
    | 'getIsFull'
    | 'getIsIdle'
    | 'getIsRunning'
    | 'getPeek'
    | 'getPendingItems'
    | 'getSize'
  > {
  /**
   * Signal version of `getActiveItems`
   */
  activeItems: Accessor<Array<() => Promise<TValue>>>
  /**
   * Signal version of `getAllItems`
   */
  allItems: Accessor<Array<() => Promise<TValue>>>
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
  peek: Accessor<(() => Promise<TValue>) | undefined>
  /**
   * Signal version of `getPendingItems`
   */
  pendingItems: Accessor<Array<() => Promise<TValue>>>
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
 * A lower-level React hook that creates an `AsyncQueuer` instance for managing an async queue of items.
 *
 * This hook provides a flexible, state-management agnostic way to handle queued async operations.
 * It returns a queuer instance with methods to add items, control queue execution, and monitor queue state.
 *
 * The queue can be configured with:
 * - Maximum concurrent operations
 * - Maximum queue size
 * - Processing function for queue items
 * - Various lifecycle callbacks
 *
 * The hook returns an object containing methods to:
 * - Add/remove items from the queue
 * - Start/stop queue processing
 * - Get queue status and items
 * - Register event handlers
 * - Control execution throttling
 *
 * @example
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = createAsyncQueuer({
 *   initialItems: [],
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: false,
 * });
 *
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Handle results
 * asyncQueuer.onSuccess((result) => {
 *   console.log('Item processed:', result);
 * });
 *
 * asyncQueuer.onError((error) => {
 *   console.error('Processing failed:', error);
 * });
 * ```
 */
export function createAsyncQueuer<TValue>(
  initialOptions: AsyncQueuerOptions<TValue> = {},
): SolidAsyncQueuer<TValue> {
  const asyncQueuer = new AsyncQueuer<TValue>(initialOptions)

  const [executionCount, setExecutionCount] = createSignal(
    asyncQueuer.getExecutionCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    asyncQueuer.getRejectionCount(),
  )
  const [isEmpty, setIsEmpty] = createSignal(asyncQueuer.getIsEmpty())
  const [isFull, setIsFull] = createSignal(asyncQueuer.getIsFull())
  const [isIdle, setIsIdle] = createSignal(asyncQueuer.getIsIdle())
  const [isRunning, setIsRunning] = createSignal(asyncQueuer.getIsRunning())
  const [allItems, setAllItems] = createSignal<Array<() => Promise<TValue>>>(
    asyncQueuer.getAllItems(),
  )
  const [activeItems, setActiveItems] = createSignal<
    Array<() => Promise<TValue>>
  >(asyncQueuer.getActiveItems())
  const [pendingItems, setPendingItems] = createSignal<
    Array<() => Promise<TValue>>
  >(asyncQueuer.getPendingItems())
  const [peek, setPeek] = createSignal<(() => Promise<TValue>) | undefined>(
    asyncQueuer.getPeek(),
  )
  const [size, setSize] = createSignal(asyncQueuer.getSize())

  asyncQueuer.setOptions({
    onItemsChange: (queuer) => {
      setExecutionCount(queuer.getExecutionCount())
      setIsEmpty(queuer.getIsEmpty())
      setIsFull(queuer.getIsFull())
      setIsIdle(queuer.getIsIdle())
      setAllItems(queuer.getAllItems())
      setActiveItems(queuer.getActiveItems())
      setPendingItems(queuer.getPendingItems())
      setPeek(() => queuer.getPeek())
      setSize(queuer.getSize())
      initialOptions.onItemsChange?.(queuer)
    },
    onIsRunningChange: (queuer) => {
      setIsRunning(queuer.getIsRunning())
      setIsIdle(queuer.getIsIdle())
      initialOptions.onIsRunningChange?.(queuer)
    },
    onReject: (item, queuer) => {
      setRejectionCount(queuer.getRejectionCount())
      initialOptions.onReject?.(item, queuer)
    },
  })

  return {
    ...bindInstanceMethods(asyncQueuer),
    activeItems,
    executionCount,
    isEmpty,
    isFull,
    isIdle,
    isRunning,
    allItems,
    peek,
    pendingItems,
    rejectionCount,
    size,
  } as SolidAsyncQueuer<TValue>
}
