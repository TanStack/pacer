import { parseFunctionOrValue } from './utils'
import type { OptionalKeys } from './types'
import type { QueuePosition } from './queuer'

export interface AsyncQueuerOptions<TValue> {
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
  concurrency?: number | ((queuer: AsyncQueuer<TValue>) => number)
  /**
   * Maximum time in milliseconds that an item can stay in the queue
   * If not provided, items will never expire
   */
  expirationDuration?: number
  /**
   * Function to determine if an item has expired
   * If provided, this overrides the expirationDuration behavior
   */
  getIsExpired?: (item: TValue, addedAt: number) => boolean
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
  getPriority?: (item: TValue) => number
  /**
   * Initial items to populate the queuer with
   */
  initialItems?: Array<TValue>
  /**
   * Maximum number of items allowed in the queuer
   */
  maxSize?: number
  /**
   * Optional error handler for when a task throws.
   * If provided, the handler will be called with the error and queuer instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (error: unknown, queuer: AsyncQueuer<TValue>) => void
  /**
   * Callback fired whenever an item expires in the queuer
   */
  onExpire?: (item: TValue, queuer: AsyncQueuer<TValue>) => void
  /**
   * Callback fired whenever the queuer's running state changes
   */
  onIsRunningChange?: (queuer: AsyncQueuer<TValue>) => void
  /**
   * Callback fired whenever an item is added or removed from the queuer
   */
  onItemsChange?: (queuer: AsyncQueuer<TValue>) => void
  /**
   * Callback fired whenever an item is rejected from being added to the queuer
   */
  onReject?: (item: TValue, queuer: AsyncQueuer<TValue>) => void
  /**
   * Optional callback to call when a task is settled
   */
  onSettled?: (queuer: AsyncQueuer<TValue>) => void
  /**
   * Optional callback to call when a task succeeds
   */
  onSuccess?: (result: TValue, queuer: AsyncQueuer<TValue>) => void
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
  wait?: number | ((queuer: AsyncQueuer<TValue>) => number)
}

type AsyncQueuerOptionsWithOptionalCallbacks = OptionalKeys<
  Required<AsyncQueuerOptions<any>>,
  | 'throwOnError'
  | 'onSuccess'
  | 'onSettled'
  | 'onReject'
  | 'onItemsChange'
  | 'onIsRunningChange'
  | 'onExpire'
  | 'onError'
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
 * A flexible asynchronous queue for processing tasks with configurable concurrency, priority, and expiration.
 *
 * Features:
 * - Priority queue support via the getPriority option
 * - Configurable concurrency limit
 * - Callbacks for task success, error, completion, and queue state changes
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause and resume processing
 * - Task cancellation
 * - Item expiration to remove stale items from the queue
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if the concurrency limit allows.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the AsyncQueuer instance
 *
 * Example usage:
 * ```ts
 * const asyncQueuer = new AsyncQueuer<string>(async (item) => {
 *   // process item
 *   return item.toUpperCase();
 * }, {
 *   concurrency: 2,
 *   onSuccess: (result) => {
 *     console.log(result);
 *   }
 * });
 *
 * asyncQueuer.addItem('hello');
 * asyncQueuer.start();
 * ```
 */
export class AsyncQueuer<TValue> {
  private _options: AsyncQueuerOptionsWithOptionalCallbacks
  private _activeItems: Set<TValue> = new Set()
  private _successCount = 0
  private _errorCount = 0
  private _settledCount = 0
  private _rejectionCount = 0
  private _expirationCount = 0
  private _items: Array<TValue> = []
  private _itemTimestamps: Array<number> = []
  private _pendingTick = false
  private _running: boolean
  private _lastResult: any

  constructor(
    private fn: (value: TValue) => Promise<any>,
    initialOptions: AsyncQueuerOptions<TValue>,
  ) {
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
   * Updates the queuer options. New options are merged with existing options.
   */
  setOptions(newOptions: Partial<AsyncQueuerOptions<TValue>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current queuer options, including defaults and any overrides.
   */
  getOptions(): AsyncQueuerOptions<TValue> {
    return this._options
  }

  /**
   * Returns the current wait time (in milliseconds) between processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  getWait(): number {
    return parseFunctionOrValue(this._options.wait, this)
  }

  /**
   * Returns the current concurrency limit for processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  getConcurrency(): number {
    return parseFunctionOrValue(this._options.concurrency, this)
  }

  /**
   * Processes items in the queue up to the concurrency limit. Internal use only.
   */
  private tick() {
    if (!this._running) {
      this._pendingTick = false
      return
    }

    // Check for expired items
    this.checkExpiredItems()

    // Process items concurrently up to the concurrency limit
    while (
      this._activeItems.size < this.getConcurrency() &&
      !this.getIsEmpty()
    ) {
      const nextItem = this.getPeek()
      if (!nextItem) {
        break
      }
      this._activeItems.add(nextItem)
      this._options.onItemsChange?.(this)
      ;(async () => {
        this._lastResult = await this.execute()

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
   * Starts processing items in the queue. If already running, does nothing.
   */
  start(): void {
    this._running = true
    if (!this._pendingTick && !this.getIsEmpty()) {
      this._pendingTick = true
      this.tick()
    }
    this._options.onIsRunningChange?.(this)
  }

  /**
   * Stops processing items in the queue. Does not clear the queue.
   */
  stop(): void {
    this._running = false
    this._pendingTick = false
    this._options.onIsRunningChange?.(this)
  }

  /**
   * Removes all pending items from the queue. Does not affect active tasks.
   */
  clear(): void {
    this._items = []
    this._options.onItemsChange?.(this)
  }

  /**
   * Resets the queuer to its initial state. Optionally repopulates with initial items.
   * Does not affect callbacks or options.
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
   * Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
   * Items can be inserted based on priority or at the front/back depending on configuration.
   *
   * @example
   * ```ts
   * queuer.addItem({ value: 'task', priority: 10 });
   * queuer.addItem('task2', 'front');
   * ```
   */
  addItem(
    item: TValue & { priority?: number },
    position: QueuePosition = this._options.addItemsTo,
    runOnItemsChange: boolean = true,
  ): void {
    if (this.getIsFull()) {
      this._rejectionCount++
      this._options.onReject?.(item, this)
      return
    }

    // Get priority either from the function or from getPriority option
    const priority =
      this._options.getPriority !== defaultOptions.getPriority
        ? this._options.getPriority(item)
        : item.priority

    if (priority !== undefined) {
      // Insert based on priority - higher priority items go to front
      const insertIndex = this._items.findIndex((existing) => {
        const existingPriority =
          this._options.getPriority !== defaultOptions.getPriority
            ? this._options.getPriority(existing)
            : (existing as any).priority
        return existingPriority < priority
      })

      if (insertIndex === -1) {
        this._items.push(item)
        this._itemTimestamps.push(Date.now())
      } else {
        this._items.splice(insertIndex, 0, item)
        this._itemTimestamps.splice(insertIndex, 0, Date.now())
      }
    } else {
      if (position === 'front') {
        // Default FIFO/LIFO behavior
        this._items.unshift(item)
        this._itemTimestamps.unshift(Date.now())
      } else {
        // LIFO
        this._items.push(item)
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
   * Removes and returns the next item from the queue without executing the task function.
   * Use for manual queue management. Normally, use execute() to process items.
   *
   * @example
   * ```ts
   * // FIFO
   * queuer.getNextItem();
   * // LIFO
   * queuer.getNextItem('back');
   * ```
   */
  getNextItem(
    position: QueuePosition = this._options.getItemsFrom,
  ): TValue | undefined {
    let item: TValue | undefined

    if (position === 'front') {
      item = this._items.shift()
      this._itemTimestamps.shift()
    } else {
      item = this._items.pop()
      this._itemTimestamps.pop()
    }

    if (item !== undefined) {
      this._options.onItemsChange?.(this)
    }

    return item
  }

  /**
   * Removes and returns the next item from the queue and executes the task function with it.
   *
   * @example
   * ```ts
   * queuer.execute();
   * // LIFO
   * queuer.execute('back');
   * ```
   */
  async execute(position?: QueuePosition): Promise<any> {
    const item = this.getNextItem(position)
    if (item !== undefined) {
      try {
        this._lastResult = await this.fn(item)
        this._successCount++
        this._options.onSuccess?.(this._lastResult, this)
      } catch (error) {
        this._errorCount++
        this._options.onError?.(error, this)
        if (this._options.throwOnError) {
          throw error
        }
      } finally {
        this._settledCount++
        this._activeItems.delete(item)
        this._options.onItemsChange?.(this)
        this._options.onSettled?.(this)
      }
    }
    return item
  }

  /**
   * Checks for expired items in the queue and removes them. Calls onExpire for each expired item.
   * Internal use only.
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
   * Returns the next item in the queue without removing it.
   *
   * @example
   * ```ts
   * queuer.getPeek(); // front
   * queuer.getPeek('back'); // back
   * ```
   */
  getPeek(position: QueuePosition = 'front'): TValue | undefined {
    if (position === 'front') {
      return this._items[0]
    }
    return this._items[this._items.length - 1]
  }

  /**
   * Returns true if the queue is empty (no pending items).
   */
  getIsEmpty(): boolean {
    return this._items.length === 0
  }

  /**
   * Returns true if the queue is full (reached maxSize).
   */
  getIsFull(): boolean {
    return this._items.length >= this._options.maxSize
  }

  /**
   * Returns the number of pending items in the queue.
   */
  getSize(): number {
    return this._items.length
  }

  /**
   * Returns a copy of all items in the queue, including active and pending items.
   */
  getAllItems(): Array<TValue> {
    return [...this.getActiveItems(), ...this.getPendingItems()]
  }

  /**
   * Returns the items currently being processed (active tasks).
   */
  getActiveItems(): Array<TValue> {
    return Array.from(this._activeItems)
  }

  /**
   * Returns the items waiting to be processed (pending tasks).
   */
  getPendingItems(): Array<TValue> {
    return [...this._items]
  }

  /**
   * Returns the number of items that have been successfully processed.
   */
  getSuccessCount(): number {
    return this._successCount
  }

  /**
   * Returns the number of items that have failed processing.
   */
  getErrorCount(): number {
    return this._errorCount
  }

  /**
   * Returns the number of items that have completed processing (success or error).
   */
  getSettledCount(): number {
    return this._settledCount
  }

  /**
   * Returns the number of items that have been rejected from being added to the queue.
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns true if the queuer is currently running (processing items).
   */
  getIsRunning(): boolean {
    return this._running
  }

  /**
   * Returns true if the queuer is running but has no items to process and no active tasks.
   */
  getIsIdle(): boolean {
    return this._running && this.getIsEmpty() && this._activeItems.size === 0
  }

  /**
   * Returns the number of items that have expired and been removed from the queue.
   */
  getExpirationCount(): number {
    return this._expirationCount
  }
}

/**
 * Creates a new AsyncQueuer instance and returns a bound addItem function for adding tasks.
 * The queuer is started automatically and ready to process items.
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and queuer instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together; the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncQueuer instance
 *
 * Example usage:
 * ```ts
 * const enqueue = asyncQueue<string>(async (item) => {
 *   return item.toUpperCase();
 * }, {...options});
 *
 * enqueue('hello');
 * ```
 */
export function asyncQueue<TValue>(
  fn: (value: TValue) => Promise<any>,
  initialOptions: AsyncQueuerOptions<TValue>,
) {
  const asyncQueuer = new AsyncQueuer<TValue>(fn, initialOptions)
  return asyncQueuer.addItem.bind(asyncQueuer)
}
