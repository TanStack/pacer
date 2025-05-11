import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type {
  AsyncQueuerFn,
  AsyncQueuerOptions,
} from '@tanstack/pacer/async-queuer'

export interface SolidAsyncQueuer<TFn extends AsyncQueuerFn>
  extends Omit<
    AsyncQueuer<TFn>,
    | 'getActiveItems'
    | 'getAllItems'
    | 'getErrorCount'
    | 'getIsEmpty'
    | 'getIsFull'
    | 'getIsIdle'
    | 'getIsRunning'
    | 'getPeek'
    | 'getPendingItems'
    | 'getRejectionCount'
    | 'getSettledCount'
    | 'getSize'
    | 'getSuccessCount'
  > {
  /**
   * Signal version of `getActiveItems`
   */
  activeItems: Accessor<Array<TFn>>
  /**
   * Signal version of `getAllItems`
   */
  allItems: Accessor<Array<TFn>>
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
   * Signal version of `getPeek`
   */
  peek: Accessor<TFn | undefined>
  /**
   * Signal version of `getPendingItems`
   */
  pendingItems: Accessor<Array<TFn>>
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
 * A lower-level Solid hook that creates an `AsyncQueuer` instance for managing an async queue of items.
 *
 * Features:
 * - Priority queue support via getPriority option
 * - Configurable concurrency limit
 * - Task success/error/completion callbacks
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume task processing
 * - Task cancellation
 * - Item expiration to clear stale items from the queue
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if below the concurrency limit.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * @example
 * ```tsx
 * // Basic async queuer for API requests
 * const asyncQueuer = createAsyncQueuer({
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
 * ```
 */
export function createAsyncQueuer<TFn extends AsyncQueuerFn>(
  initialOptions: AsyncQueuerOptions<TFn> = {},
): SolidAsyncQueuer<TFn> {
  const asyncQueuer = new AsyncQueuer<TFn>(initialOptions)

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
  const [allItems, setAllItems] = createSignal<Array<TFn>>(
    asyncQueuer.getAllItems(),
  )
  const [activeItems, setActiveItems] = createSignal<Array<TFn>>(
    asyncQueuer.getActiveItems(),
  )
  const [pendingItems, setPendingItems] = createSignal<Array<TFn>>(
    asyncQueuer.getPendingItems(),
  )
  const [peek, setPeek] = createSignal<TFn | undefined>(asyncQueuer.getPeek())
  const [size, setSize] = createSignal(asyncQueuer.getSize())

  asyncQueuer.setOptions({
    onItemsChange: (queuer) => {
      setActiveItems(queuer.getActiveItems())
      setAllItems(queuer.getAllItems())
      setErrorCount(queuer.getErrorCount())
      setIsEmpty(queuer.getIsEmpty())
      setIsFull(queuer.getIsFull())
      setIsIdle(queuer.getIsIdle())
      setPeek(() => queuer.getPeek())
      setPendingItems(queuer.getPendingItems())
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
    peek,
    pendingItems,
    rejectionCount,
    settledCount,
    size,
    successCount,
  } as SolidAsyncQueuer<TFn>
}
