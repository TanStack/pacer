import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AsyncQueuerOptions } from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuer<TValue>
  extends Omit<
    AsyncQueuer<TValue>,
    | 'getErrorCount'
    | 'getIsEmpty'
    | 'getIsFull'
    | 'getIsIdle'
    | 'getIsRunning'
    | 'getRejectionCount'
    | 'getSettledCount'
    | 'getSize'
    | 'getSuccessCount'
    | 'peekActiveItems'
    | 'peekAllItems'
    | 'peekNextItem'
    | 'peekPendingItems'
  > {
  /**
   * Signal version of `peekActiveItems`
   */
  activeItems: Accessor<Array<TValue>>
  /**
   * Signal version of `peekAllItems`
   */
  allItems: Accessor<Array<TValue>>
  /**
   * Signal version of `getErrorCount`
   */
  errorCount: Accessor<number>
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
   * Signal version of `peekNextItem`
   */
  nextItem: Accessor<TValue | undefined>
  /**
   * Signal version of `peekPendingItems`
   */
  pendingItems: Accessor<Array<TValue>>
  /**
   * Signal version of `getRejectionCount`
   */
  rejectionCount: Accessor<number>
  /**
   * Signal version of `getSettledCount`
   */
  settledCount: Accessor<number>
  /**
   * Signal version of `getSize`
   */
  size: Accessor<number>
  /**
   * Signal version of `getSuccessCount`
   */
  successCount: Accessor<number>
}

/**
 * Creates a Solid-compatible AsyncQueuer instance for managing an asynchronous queue of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Priority queueing via `getPriority` or item `priority` property
 * - Configurable concurrency limit
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume processing
 * - Task cancellation
 * - Item expiration
 * - Lifecycle callbacks for success, error, settled, items change, etc.
 * - All stateful properties (active items, pending items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if the concurrency limit allows.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * Example usage:
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = createAsyncQueuer(async (item) => {
 *   // process item
 *   return await fetchData(item);
 * }, {
 *   initialItems: [],
 *   concurrency: 2,
 *   maxSize: 100,
 *   started: false,
 *   onSuccess: (result) => {
 *     console.log('Item processed:', result);
 *   },
 *   onError: (error) => {
 *     console.error('Processing failed:', error);
 *   }
 * });
 *
 * // Add items to queue
 * asyncQueuer.addItem(newItem);
 *
 * // Start processing
 * asyncQueuer.start();
 *
 * // Use Solid signals in your UI
 * const pending = asyncQueuer.pendingItems();
 * ```
 */
export function createAsyncQueuer<TValue>(
  fn: (value: TValue) => Promise<any>,
  initialOptions: AsyncQueuerOptions<TValue> = {},
): SolidAsyncQueuer<TValue> {
  const asyncQueuer = new AsyncQueuer<TValue>(fn, initialOptions)

  const [successCount, setSuccessCount] = createSignal(
    asyncQueuer.getSuccessCount(),
  )
  const [errorCount, setErrorCount] = createSignal(asyncQueuer.getErrorCount())
  const [settledCount, setSettledCount] = createSignal(
    asyncQueuer.getSettledCount(),
  )
  const [rejectionCount, setRejectionCount] = createSignal(
    asyncQueuer.getRejectionCount(),
  )
  const [isEmpty, setIsEmpty] = createSignal(asyncQueuer.getIsEmpty())
  const [isFull, setIsFull] = createSignal(asyncQueuer.getIsFull())
  const [isIdle, setIsIdle] = createSignal(asyncQueuer.getIsIdle())
  const [isRunning, setIsRunning] = createSignal(asyncQueuer.getIsRunning())
  const [allItems, setAllItems] = createSignal<Array<TValue>>(
    asyncQueuer.peekAllItems(),
  )
  const [activeItems, setActiveItems] = createSignal<Array<TValue>>(
    asyncQueuer.peekActiveItems(),
  )
  const [pendingItems, setPendingItems] = createSignal<Array<TValue>>(
    asyncQueuer.peekPendingItems(),
  )
  const [nextItem, setNextItem] = createSignal<TValue | undefined>(
    asyncQueuer.peekNextItem(),
  )
  const [size, setSize] = createSignal(asyncQueuer.getSize())

  asyncQueuer.setOptions({
    onItemsChange: (queuer) => {
      setActiveItems(queuer.peekActiveItems())
      setAllItems(queuer.peekAllItems())
      setErrorCount(queuer.getErrorCount())
      setIsEmpty(queuer.getIsEmpty())
      setIsFull(queuer.getIsFull())
      setIsIdle(queuer.getIsIdle())
      setNextItem(() => queuer.peekNextItem())
      setPendingItems(queuer.peekPendingItems())
      setRejectionCount(queuer.getRejectionCount())
      setSettledCount(queuer.getSettledCount())
      setSize(queuer.getSize())
      setSuccessCount(queuer.getSuccessCount())
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
    allItems,
    errorCount,
    isEmpty,
    isFull,
    isIdle,
    isRunning,
    nextItem,
    pendingItems,
    rejectionCount,
    settledCount,
    size,
    successCount,
  } as SolidAsyncQueuer<TValue>
}
