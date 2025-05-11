import { parseFunctionOrValue } from './utils'
import type { AnyAsyncFunction, OptionalKeys } from './types'
import type { QueuePosition } from './queuer'

export type AsyncQueuerFn = AnyAsyncFunction & { priority?: number }

export interface AsyncQueuerOptions<TFn extends AsyncQueuerFn> {
  /**
   * Default position to add items to the queuer
   * @default 'back'
   */
  addItemsTo?: QueuePosition
  /**
   * Maximum number of concurrent tasks to process.
   * Can be a number or a function that returns a number.
   * @default 1
   */
  concurrency?: number | ((queuer: AsyncQueuer<TFn>) => number)
  /**
   * Maximum time in milliseconds that an item can stay in the queue
   * If not provided, items will never expire
   */
  expirationDuration?: number
  /**
   * Function to determine if an item has expired
   * If provided, this overrides the expirationDuration behavior
   */
  getIsExpired?: (item: TFn, addedAt: number) => boolean
  /**
   * Default position to get items from during processing
   * @default 'front'
   */
  getItemsFrom?: QueuePosition
  /**
   * Function to determine priority of items in the queuer
   * Higher priority items will be processed first
   * If not provided, will use static priority values attached to tasks
   */
  getPriority?: (item: TFn) => number
  /**
   * Initial items to populate the queuer with
   */
  initialItems?: Array<TFn & { priority?: number }>
  /**
   * Maximum number of items allowed in the queuer
   */
  maxSize?: number
  /**
   * Optional error handler for when a task throws.
   * If provided, the handler will be called with the error and queuer instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (error: unknown, queuer: AsyncQueuer<TFn>) => void
  /**
   * Callback fired whenever an item expires in the queuer
   */
  onExpire?: (item: TFn, queuer: AsyncQueuer<TFn>) => void
  /**
   * Callback fired whenever an item is removed from the queuer
   */
  onGetNextItem?: (item: TFn, queuer: AsyncQueuer<TFn>) => void
  /**
   * Callback fired whenever the queuer's running state changes
   */
  onIsRunningChange?: (queuer: AsyncQueuer<TFn>) => void
  /**
   * Callback fired whenever an item is added or removed from the queuer
   */
  onItemsChange?: (queuer: AsyncQueuer<TFn>) => void
  /**
   * Callback fired whenever an item is rejected from being added to the queuer
   */
  onReject?: (item: TFn, queuer: AsyncQueuer<TFn>) => void
  /**
   * Optional callback to call when a task is settled
   */
  onSettled?: (queuer: AsyncQueuer<TFn>) => void
  /**
   * Optional callback to call when a task succeeds
   */
  onSuccess?: (result: TFn, queuer: AsyncQueuer<TFn>) => void
  /**
   * Whether the queuer should start processing tasks immediately or not.
   */
  started?: boolean
  /**
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Time in milliseconds to wait between processing items.
   * Can be a number or a function that returns a number.
   * @default 0
   */
  wait?: number | ((queuer: AsyncQueuer<TFn>) => number)
}

type AsyncQueuerOptionsWithOptionalCallbacks = OptionalKeys<
  Required<AsyncQueuerOptions<any>>,
  | 'onError'
  | 'onExpire'
  | 'onGetNextItem'
  | 'onIsRunningChange'
  | 'onItemsChange'
  | 'onReject'
  | 'onSettled'
  | 'onSuccess'
  | 'throwOnError'
>

const defaultOptions: AsyncQueuerOptionsWithOptionalCallbacks = {
  addItemsTo: 'back',
  concurrency: 1,
  expirationDuration: Infinity,
  getIsExpired: () => false,
  getItemsFrom: 'front',
  getPriority: (item: any) => item?.priority ?? 0,
  initialItems: [],
  maxSize: Infinity,
  started: true,
  wait: 0,
}

/**
 * A flexible asynchronous queue that processes tasks with configurable concurrency control.
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
 * ```ts
 * const asyncQueuer = new AsyncQueuer<string>({
 *   concurrency: 2,
 *   onSuccess: (result) => {
 *     console.log(result); // 'Hello'
 *   }
 * });
 *
 * asyncQueuer.addItem(async () => {
 *   return 'Hello';
 * });
 *
 * asyncQueuer.start();
 * ```
 */
export class AsyncQueuer<TFn extends AsyncQueuerFn> {
  private _options: AsyncQueuerOptionsWithOptionalCallbacks
  private _activeItems: Set<TFn> = new Set()
  private _successCount = 0
  private _errorCount = 0
  private _settledCount = 0
  private _rejectionCount = 0
  private _expirationCount = 0
  private _items: Array<TFn> = []
  private _itemTimestamps: Array<number> = []
  private _pendingTick = false
  private _running: boolean

  constructor(initialOptions: AsyncQueuerOptions<TFn> = defaultOptions) {
    this._options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this._running = this._options.started

    for (let i = 0; i < this._options.initialItems.length; i++) {
      const item = this._options.initialItems[i]!
      const isLast = i === this._options.initialItems.length - 1
      this.addItem(item, this._options.addItemsTo, isLast)
    }
  }

  /**
   * Updates the queuer options
   * Returns the new options state
   */
  setOptions(newOptions: Partial<AsyncQueuerOptions<TFn>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current queuer options
   */
  getOptions(): AsyncQueuerOptions<TFn> {
    return this._options
  }

  /**
   * Returns the current wait time between processing items
   */
  getWait(): number {
    return parseFunctionOrValue(this._options.wait, this)
  }

  /**
   * Returns the current concurrency limit
   */
  getConcurrency(): number {
    return parseFunctionOrValue(this._options.concurrency, this)
  }

  /**
   * Processes items in the queuer
   */
  private tick() {
    if (!this._running) {
      this._pendingTick = false
      return
    }

    // Check for expired items
    this.checkExpiredItems()

    while (
      this._activeItems.size < this.getConcurrency() &&
      !this.getIsEmpty()
    ) {
      const nextFn = this.getNextItem()
      if (!nextFn) {
        break
      }
      this._activeItems.add(nextFn)
      this._options.onItemsChange?.(this)
      ;(async () => {
        let res!: TFn

        try {
          res = await nextFn()
          this._successCount++
          this._options.onSuccess?.(res, this)
        } catch (error) {
          this._errorCount++
          this._options.onError?.(error, this)
          if (this._options.throwOnError) {
            throw error
          } else {
            console.error(error)
          }
        } finally {
          this._settledCount++
          this._activeItems.delete(nextFn)
          this._options.onItemsChange?.(this)
          this._options.onSettled?.(this)
        }

        const wait = this.getWait()
        if (wait > 0) {
          setTimeout(() => this.tick(), wait)
          return
        }

        this.tick()
      })()
    }

    this._pendingTick = false
  }

  /**
   * Checks for and removes expired items from the queuer
   */
  private checkExpiredItems(): void {
    if (
      this._options.expirationDuration === Infinity &&
      this._options.getIsExpired === defaultOptions.getIsExpired
    )
      return

    const now = Date.now()
    const expiredIndices: Array<number> = []

    // Find indices of expired items
    for (let i = 0; i < this._items.length; i++) {
      const timestamp = this._itemTimestamps[i]
      if (timestamp === undefined) continue

      const item = this._items[i]
      if (item === undefined) continue

      const isExpired =
        this._options.getIsExpired !== defaultOptions.getIsExpired
          ? this._options.getIsExpired(item, timestamp)
          : now - timestamp > this._options.expirationDuration

      if (isExpired) {
        expiredIndices.push(i)
      }
    }

    // Remove expired items from back to front to maintain indices
    for (let i = expiredIndices.length - 1; i >= 0; i--) {
      const index = expiredIndices[i]
      if (index === undefined) continue

      const expiredItem = this._items[index]
      if (expiredItem === undefined) continue

      this._items.splice(index, 1)
      this._itemTimestamps.splice(index, 1)
      this._expirationCount++
      this._options.onExpire?.(expiredItem, this)
    }

    if (expiredIndices.length > 0) {
      this._options.onItemsChange?.(this)
    }
  }

  /**
   * Starts the queuer and processes items
   */
  start(): Promise<void> {
    this._running = true
    if (!this._pendingTick && !this.getIsEmpty()) {
      this._pendingTick = true
      this.tick()
    }
    this._options.onIsRunningChange?.(this)

    return new Promise<void>((resolve) => {
      const checkIdle = () => {
        if (this.getIsIdle()) {
          resolve()
        } else {
          setTimeout(checkIdle, 100)
        }
      }
      checkIdle()
    })
  }

  /**
   * Stops the queuer from processing items
   */
  stop(): void {
    this._running = false
    this._pendingTick = false
    this._options.onIsRunningChange?.(this)
  }

  /**
   * Removes all items from the queuer
   */
  clear(): void {
    this._items = []
    this._options.onItemsChange?.(this)
  }

  /**
   * Resets the queuer to its initial state
   */
  reset(withInitialItems?: boolean): void {
    this.clear()
    this._successCount = 0
    this._errorCount = 0
    this._settledCount = 0
    if (withInitialItems) {
      this._items = [...this._options.initialItems]
    }
    this._running = this._options.started
  }

  /**
   * Adds a task to the queuer
   */
  addItem(
    fn: TFn,
    position: QueuePosition = this._options.addItemsTo,
    runOnItemsChange: boolean = true,
  ): void {
    if (this.getIsFull()) {
      this._rejectionCount++
      this._options.onReject?.(fn, this)
      return
    }

    // Get priority either from the function or from getPriority option
    const priority =
      this._options.getPriority !== defaultOptions.getPriority
        ? this._options.getPriority(fn)
        : fn.priority

    if (priority !== undefined) {
      // Insert based on priority
      const insertIndex = this._items.findIndex((existing) => {
        const existingPriority =
          this._options.getPriority !== defaultOptions.getPriority
            ? this._options.getPriority(existing)
            : (existing as any).priority
        return existingPriority > priority
      })

      if (insertIndex === -1) {
        this._items.push(fn)
        this._itemTimestamps.push(Date.now())
      } else {
        this._items.splice(insertIndex, 0, fn)
        this._itemTimestamps.splice(insertIndex, 0, Date.now())
      }
    } else {
      if (position === 'front') {
        // Default FIFO/LIFO behavior
        this._items.unshift(fn)
        this._itemTimestamps.unshift(Date.now())
      } else {
        // LIFO
        this._items.push(fn)
        this._itemTimestamps.push(Date.now())
      }
    }

    if (runOnItemsChange) {
      this._options.onItemsChange?.(this)
    }

    if (this._running && !this._pendingTick) {
      this._pendingTick = true
      this.tick()
    }
  }

  /**
   * Removes and returns an item from the queuer
   */
  getNextItem(
    position: QueuePosition = this._options.getItemsFrom,
  ): TFn | undefined {
    let item: TFn | undefined

    if (position === 'front') {
      item = this._items.shift()
      this._itemTimestamps.shift()
    } else {
      item = this._items.pop()
      this._itemTimestamps.pop()
    }

    if (item !== undefined) {
      this._options.onItemsChange?.(this)
      this._options.onGetNextItem?.(item, this)
    }
    return item
  }

  /**
   * Returns an item without removing it
   */
  getPeek(position: QueuePosition = 'front'): TFn | undefined {
    if (position === 'front') {
      return this._items[0]
    }
    return this._items[this._items.length - 1]
  }

  /**
   * Returns true if the queuer is empty
   */
  getIsEmpty(): boolean {
    return this._items.length === 0
  }

  /**
   * Returns true if the queuer is full
   */
  getIsFull(): boolean {
    return this._items.length >= this._options.maxSize
  }

  /**
   * Returns the current size of the queuer
   */
  getSize(): number {
    return this._items.length
  }

  /**
   * Returns a copy of all items in the queuer
   */
  getAllItems(): Array<TFn> {
    return [...this.getActiveItems(), ...this.getPendingItems()]
  }

  /**
   * Returns the active items
   */
  getActiveItems(): Array<TFn> {
    return Array.from(this._activeItems)
  }

  /**
   * Returns the pending items
   */
  getPendingItems(): Array<TFn> {
    return [...this._items]
  }

  /**
   * Returns the number of items that have been successfully processed
   */
  getSuccessCount(): number {
    return this._successCount
  }

  /**
   * Returns the number of items that have failed processing
   */
  getErrorCount(): number {
    return this._errorCount
  }

  /**
   * Returns the number of items that have completed processing (success or error)
   */
  getSettledCount(): number {
    return this._settledCount
  }

  /**
   * Returns the number of items that have been rejected from the queuer
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns true if the queuer is running
   */
  getIsRunning(): boolean {
    return this._running
  }

  /**
   * Returns true if the queuer is running but has no items to process
   */
  getIsIdle(): boolean {
    return this._running && this.getIsEmpty() && this._activeItems.size === 0
  }

  /**
   * Returns the number of items that have expired from the queuer
   */
  getExpirationCount(): number {
    return this._expirationCount
  }
}

/**
 * Creates a new AsyncQueuer instance with the given options and returns a bound addItem function.
 * The queuer is automatically started and ready to process items.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * @example
 * ```ts
 * const enqueue = asyncQueue<string>();
 *
 * // Add items to be processed
 * enqueue(async () => {
 *   return 'Hello';
 * });
 * ```
 *
 * @param options - Configuration options for the AsyncQueuer
 * @returns A bound addItem function that can be used to add tasks to the queuer
 */
export function asyncQueue<TFn extends AsyncQueuerFn>(
  options: AsyncQueuerOptions<TFn>,
) {
  const queuer = new AsyncQueuer<TFn>(options)
  return queuer.addItem.bind(queuer)
}
