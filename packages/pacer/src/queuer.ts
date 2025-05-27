import { parseFunctionOrValue } from './utils'

/**
 * Options for configuring a Queuer instance.
 *
 * These options control queue behavior, item expiration, callbacks, and more.
 */
export interface QueuerOptions<TValue> {
  /**
   * Default position to add items to the queuer
   * @default 'back'
   */
  addItemsTo?: QueuePosition
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
   * Callback fired whenever an item expires in the queuer
   */
  onExpire?: (item: TValue, queuer: Queuer<TValue>) => void
  /**
   * Callback fired whenever an item is removed from the queuer
   */
  onExecute?: (item: TValue, queuer: Queuer<TValue>) => void
  /**
   * Callback fired whenever the queuer's running state changes
   */
  onIsRunningChange?: (queuer: Queuer<TValue>) => void
  /**
   * Callback fired whenever an item is added or removed from the queuer
   */
  onItemsChange?: (queuer: Queuer<TValue>) => void
  /**
   * Callback fired whenever an item is rejected from being added to the queuer
   */
  onReject?: (item: TValue, queuer: Queuer<TValue>) => void
  /**
   * Whether the queuer should start processing tasks immediately
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items.
   * Can be a number or a function that returns a number.
   * @default 0
   */
  wait?: number | ((queuer: Queuer<TValue>) => number)
}

const defaultOptions: Required<QueuerOptions<any>> = {
  addItemsTo: 'back',
  getItemsFrom: 'front',
  getPriority: (item) => item?.priority ?? 0,
  getIsExpired: () => false,
  expirationDuration: Infinity,
  initialItems: [],
  maxSize: Infinity,
  onExecute: () => {},
  onIsRunningChange: () => {},
  onItemsChange: () => {},
  onReject: () => {},
  onExpire: () => {},
  started: true,
  wait: 0,
}

/**
 * Position type for addItem and getNextItem operations.
 *
 * - 'front': Operate on the front of the queue (FIFO)
 * - 'back': Operate on the back of the queue (LIFO)
 */
export type QueuePosition = 'front' | 'back'

/**
 * A flexible queue that processes items with configurable wait times, expiration, and priority.
 *
 * Features:
 * - Automatic or manual processing of items
 * - FIFO (First In First Out), LIFO (Last In First Out), or double-ended queue behavior
 * - Priority-based ordering when getPriority is provided
 * - Item expiration and removal of stale items
 * - Callbacks for queue state changes, execution, rejection, and expiration
 *
 * Running behavior:
 * - `start()`: Begins automatically processing items in the queue (defaults to running)
 * - `stop()`: Pauses processing but maintains queue state
 * - `wait`: Configurable delay between processing items
 * - `onItemsChange`/`onExecute`: Callbacks for monitoring queue state
 *
 * Manual processing is also supported when automatic processing is disabled:
 * - `execute()`: Processes the next item using the provided function
 * - `getNextItem()`: Removes and returns the next item without processing
 *
 * Queue behavior defaults to FIFO:
 * - `addItem(item)`: Adds to the back of the queue
 * - Items processed from the front of the queue
 *
 * Priority queue:
 * - Provide a `getPriority` function; higher values are processed first
 *
 * Stack (LIFO):
 * - `addItem(item, 'back')`: Adds to the back
 * - `getNextItem('back')`: Removes from the back
 *
 * Double-ended queue:
 * - `addItem(item, position)`: Adds to specified position ('front'/'back')
 * - `getNextItem(position)`: Removes from specified position
 *
 * Item expiration:
 * - `expirationDuration`: Maximum time items can stay in the queue
 * - `getIsExpired`: Function to override default expiration
 * - `onExpire`: Callback for expired items
 *
 * Example usage:
 * ```ts
 * // Auto-processing queue with wait time
 * const autoQueue = new Queuer<number>((n) => console.log(n), {
 *   started: true, // Begin processing immediately
 *   wait: 1000, // Wait 1s between items
 *   onExecute: (item) => console.log(`Processed ${item}`)
 * });
 * autoQueue.addItem(1); // Will process after 1s
 * autoQueue.addItem(2); // Will process 1s after first item
 *
 * // Manual processing queue
 * const manualQueue = new Queuer<number>((n) => console.log(n), {
 *   started: false
 * });
 * manualQueue.addItem(1); // [1]
 * manualQueue.addItem(2); // [1, 2]
 * manualQueue.execute(); // logs 1, queue is [2]
 * manualQueue.getNextItem(); // returns 2, queue is empty
 * ```
 */
export class Queuer<TValue> {
  private _options: Required<QueuerOptions<TValue>>
  private _items: Array<TValue> = []
  private _itemTimestamps: Array<number> = []
  private _executionCount = 0
  private _rejectionCount = 0
  private _expirationCount = 0
  private _onItemsChanges: Array<(item: TValue) => void> = []
  private _running: boolean
  private _pendingTick = false

  constructor(
    private fn: (item: TValue) => void,
    initialOptions: QueuerOptions<TValue> = {},
  ) {
    this._options = { ...defaultOptions, ...initialOptions }
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
  setOptions(newOptions: Partial<QueuerOptions<TValue>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current queuer options, including defaults and any overrides.
   */
  getOptions(): Required<QueuerOptions<TValue>> {
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
   * Processes items in the queue up to the wait interval. Internal use only.
   */
  private tick() {
    if (!this._running) {
      this._pendingTick = false
      return
    }

    // Check for expired items
    this.checkExpiredItems()

    while (!this.getIsEmpty()) {
      const nextItem = this.execute(this._options.getItemsFrom)
      if (nextItem === undefined) {
        break
      }
      this._onItemsChanges.forEach((cb) => cb(nextItem))

      const wait = this.getWait()
      if (wait > 0) {
        // Use setTimeout to wait before processing next item
        setTimeout(() => this.tick(), wait)
        return
      }

      this.tick()
    }
    this._pendingTick = false
  }

  /**
   * Checks for expired items in the queue and removes them. Calls onExpire for each expired item.
   * Internal use only.
   */
  private checkExpiredItems() {
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
      this._options.onExpire(expiredItem, this)
    }

    if (expiredIndices.length > 0) {
      this._options.onItemsChange(this)
    }
  }

  /**
   * Stops processing items in the queue. Does not clear the queue.
   */
  stop() {
    this._running = false
    this._pendingTick = false
    this._options.onIsRunningChange(this)
  }

  /**
   * Starts processing items in the queue. If already running, does nothing.
   */
  start() {
    this._running = true
    if (!this._pendingTick && !this.getIsEmpty()) {
      this._pendingTick = true
      this.tick()
    }
    this._options.onIsRunningChange(this)
  }

  /**
   * Removes all pending items from the queue. Does not affect items being processed.
   */
  clear(): void {
    this._items = []
    this._options.onItemsChange(this)
  }

  /**
   * Resets the queuer to its initial state. Optionally repopulates with initial items.
   * Does not affect callbacks or options.
   */
  reset(withInitialItems?: boolean): void {
    this.clear()
    this._executionCount = 0
    if (withInitialItems) {
      this._items = [...this._options.initialItems]
    }
    this._running = this._options.started
  }

  /**
   * Adds an item to the queue. If the queue is full, the item is rejected and onReject is called.
   * Items can be inserted based on priority or at the front/back depending on configuration.
   *
   * Returns true if the item was added, false if the queue is full.
   *
   * Example usage:
   * ```ts
   * queuer.addItem('task');
   * queuer.addItem('task2', 'front');
   * ```
   */
  addItem(
    item: TValue,
    position: QueuePosition = this._options.addItemsTo,
    runOnUpdate: boolean = true,
  ): boolean {
    if (this.getIsFull()) {
      this._rejectionCount++
      this._options.onReject(item, this)
      return false
    }

    if (this._options.getPriority !== defaultOptions.getPriority) {
      // If custom priority function is provided, insert based on priority
      const priority = this._options.getPriority(item)
      const insertIndex = this._items.findIndex(
        (existing) => this._options.getPriority(existing) < priority,
      )

      if (insertIndex === -1) {
        this._items.push(item)
        this._itemTimestamps.push(Date.now())
      } else {
        this._items.splice(insertIndex, 0, item)
        this._itemTimestamps.splice(insertIndex, 0, Date.now())
      }
    } else {
      // Default FIFO/LIFO behavior
      if (position === 'front') {
        this._items.unshift(item)
        this._itemTimestamps.unshift(Date.now())
      } else {
        this._items.push(item)
        this._itemTimestamps.push(Date.now())
      }
    }

    if (this._running && !this._pendingTick) {
      this._pendingTick = true
      this.tick()
    }
    if (runOnUpdate) {
      this._options.onItemsChange(this)
    }
    return true
  }

  /**
   * Removes and returns the next item from the queue without executing the function.
   * Use for manual queue management. Normally, use execute() to process items.
   *
   * Example usage:
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
      this._options.onItemsChange(this)
    }

    return item
  }

  /**
   * Removes and returns the next item from the queue and processes it using the provided function.
   *
   * Example usage:
   * ```ts
   * queuer.execute();
   * // LIFO
   * queuer.execute('back');
   * ```
   */
  execute(position?: QueuePosition): TValue | undefined {
    const item = this.getNextItem(position)
    if (item !== undefined) {
      this.fn(item)
      this._executionCount++
      this._options.onExecute(item, this)
    }
    return item
  }

  /**
   * Returns the next item in the queue without removing it.
   *
   * Example usage:
   * ```ts
   * queuer.peekNextItem(); // front
   * queuer.peekNextItem('back'); // back
   * ```
   */
  peekNextItem(
    position: QueuePosition = this._options.getItemsFrom,
  ): TValue | undefined {
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
   * Returns a copy of all items in the queue.
   */
  peekAllItems(): Array<TValue> {
    return [...this._items]
  }

  /**
   * Returns the number of items that have been processed and removed from the queue.
   */
  getExecutionCount(): number {
    return this._executionCount
  }

  /**
   * Returns the number of items that have been rejected from being added to the queue.
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns the number of items that have expired and been removed from the queue.
   */
  getExpirationCount(): number {
    return this._expirationCount
  }

  /**
   * Returns true if the queuer is currently running (processing items).
   */
  getIsRunning() {
    return this._running
  }

  /**
   * Returns true if the queuer is running but has no items to process.
   */
  getIsIdle() {
    return this._running && this.getIsEmpty()
  }
}

/**
 * Creates a queue that processes items immediately upon addition.
 * Items are processed sequentially in FIFO order by default.
 *
 * This is a simplified wrapper around the Queuer class that only exposes the
 * `addItem` method. The queue is always running and will process items as they are added.
 * For more control over queue processing, use the Queuer class directly.
 *
 * Example usage:
 * ```ts
 * // Basic sequential processing
 * const processItems = queue<number>((n) => console.log(n), {
 *   wait: 1000,
 *   onItemsChange: (queuer) => console.log(queuer.peekAllItems())
 * });
 * processItems(1); // Logs: 1
 * processItems(2); // Logs: 2 after 1 completes
 *
 * // Priority queue
 * const processPriority = queue<number>((n) => console.log(n), {
 *   getPriority: n => n // Higher numbers processed first
 * });
 * processPriority(1);
 * processPriority(3); // Processed before 1
 * ```
 */
export function queue<TValue>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue>,
) {
  const queuer = new Queuer<TValue>(fn, options)
  return queuer.addItem.bind(queuer)
}
