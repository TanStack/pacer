import { parseFunctionOrValue } from './utils'

/**
 * Options for configuring a Queuer instance
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
 * Position type for addItem and getNextItem operations
 */
export type QueuePosition = 'front' | 'back'

/**
 * A flexible queue data structure that automatically processes items with configurable
 * wait times between executions. The queuer maintains its state when stopped/started
 * and provides fine-grained control over how items are processed.
 *
 * Running behavior:
 * - start(): begins automatically processing items in the queue (defaults to running)
 * - stop(): pauses processing but maintains queue state
 * - wait: configurable delay between processing items
 * - onItemsChange/onExecute: callbacks for monitoring queue state
 *
 * Manual processing is also supported when automatic processing is disabled:
 * - execute(): processes next item using provided function
 * - getNextItem(): removes and returns next item without processing
 *
 * Queue behavior defaults to FIFO (First In First Out):
 * - addItem(item): adds to back of queue
 * - Items processed from front of queue
 *
 * Supports priority-based ordering when getPriority function is provided.
 * Items with higher priority values will be processed first.
 *
 * Alternative queue behaviors:
 * Stack (LIFO):
 * - addItem(item, 'back'): adds to back
 * - getNextItem('back'): removes from back
 *
 * Double-ended queue:
 * - addItem(item, position): adds to specified position ('front'/'back')
 * - getNextItem(position): removes from specified position
 *
 * Supports item expiration to clear stale items:
 * - expirationDuration: maximum time items can stay in queue
 * - getIsExpired: function to override default expiration
 * - onExpire: callback for expired items
 *
 * @example
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
   * Updates the queuer options
   */
  setOptions(newOptions: Partial<QueuerOptions<TValue>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current queuer options
   */
  getOptions(): Required<QueuerOptions<TValue>> {
    return this._options
  }

  /**
   * Returns the current wait time in milliseconds
   */
  getWait(): number {
    return parseFunctionOrValue(this._options.wait, this)
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
   * Checks for and removes expired items from the queuer
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
   * Stops the queuer from processing items
   */
  stop() {
    this._running = false
    this._pendingTick = false
    this._options.onIsRunningChange(this)
  }

  /**
   * Starts the queuer and processes items
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
   * Removes all items from the queuer
   */
  clear(): void {
    this._items = []
    this._options.onItemsChange(this)
  }

  /**
   * Resets the queuer to its initial state
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
   * Adds an item to the queuer and starts processing if not already running
   * @returns true if item was added, false if queuer is full
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
        (existing) => this._options.getPriority(existing) > priority,
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
   * Removes and returns an item from the queuer using shift (default) or pop without executing the function
   *
   * Note: Normally, you should use execute instead of getNextItem
   *
   * @example
   * ```ts
   * // Standard FIFO queuer
   * queuer.getNextItem()
   * // Stack-like behavior (LIFO)
   * queuer.getNextItem('back')
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
   * Removes and returns an item from the queuer using shift (default) or pop and then processes the fn by calling the queuer's function with the item as the argument
   *
   * @example
   * ```ts
   * // Standard FIFO queuer
   * queuer.execute()
   * // Stack-like behavior (LIFO)
   * queuer.execute('back')
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
   * Returns an item without removing it
   *
   * @example
   * ```ts
   * // Look at next item to getNextItem
   * queuer.getPeek()
   * // Look at last item (like stack top)
   * queuer.getPeek('back')
   * ```
   */
  getPeek(
    position: QueuePosition = this._options.getItemsFrom,
  ): TValue | undefined {
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
  getAllItems(): Array<TValue> {
    return [...this._items]
  }

  /**
   * Returns the number of items that have been removed from the queuer
   */
  getExecutionCount(): number {
    return this._executionCount
  }

  /**
   * Returns the number of items that have been rejected from the queuer
   */
  getRejectionCount(): number {
    return this._rejectionCount
  }

  /**
   * Returns the number of items that have expired from the queuer
   */
  getExpirationCount(): number {
    return this._expirationCount
  }

  /**
   * Returns true if the queuer is running
   */
  getIsRunning() {
    return this._running
  }

  /**
   * Returns true if the queuer is running but has no items to process
   */
  getIsIdle() {
    return this._running && this.getIsEmpty()
  }
}

/**
 * Creates a queue that processes items in a queuer immediately upon addition.
 * Items are processed sequentially in FIFO order by default.
 *
 * This is a simplified wrapper around the Queuer class that only exposes the
 * `addItem` method. This queue is always running and will process items as they are added.
 * For more control over queuer processing, use the Queuer class
 * directly which provides methods like `start`, `stop`, `reset`, and more.
 *
 * @example
 * ```ts
 * // Basic sequential processing
 * const processItems = queuer<number>({
 *   wait: 1000,
 *   onItemsChange: (queuer) => console.log(queuer.getAllItems())
 * })
 * processItems(1) // Logs: 1
 * processItems(2) // Logs: 2 after 1 completes
 *
 * // Priority queuer
 * const processPriority = queuer<number>({
 *   process: async (n) => console.log(n),
 *   getPriority: n => n // Higher numbers processed first
 * })
 * processPriority(1)
 * processPriority(3) // Processed before 1
 * ```
 */
export function queue<TValue>(
  fn: (item: TValue) => void,
  options: QueuerOptions<TValue>,
) {
  const queuer = new Queuer<TValue>(fn, options)
  return queuer.addItem.bind(queuer)
}
