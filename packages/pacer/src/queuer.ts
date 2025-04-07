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
   * Callback fired whenever an item is removed from the queuer
   */
  onGetNextItem?: (item: TValue, queuer: Queuer<TValue>) => void
  /**
   * Callback fired whenever an item is added or removed from the queuer
   */
  onUpdate?: (queuer: Queuer<TValue>) => void
  /**
   * Whether the queuer should start processing tasks immediately
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items
   */
  wait?: number
}

const defaultOptions: Required<QueuerOptions<any>> = {
  addItemsTo: 'back',
  getItemsFrom: 'front',
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
  onGetNextItem: () => {},
  onUpdate: () => {},
  started: false,
  wait: 0,
}

/**
 * Position type for addItem and getNextItem operations
 */
export type QueuePosition = 'front' | 'back'

/**
 * A flexible queue data structure that defaults to FIFO (First In First Out) behavior
 * with optional position overrides for stack-like or double-ended operations.
 *
 * The queuer can automatically process items as they are added, with configurable
 * wait times between processing each item. Processing can be started/stopped
 * and the queuer will maintain its state.
 *
 * Supports priority-based ordering when a getPriority function is provided.
 * Items with higher priority values will be processed first.
 *
 * Default queue behavior:
 * - addItem(item): adds to back of queuer
 * - getNextItem(): removes and returns from front of queuer
 *
 * Stack (LIFO) behavior:
 * - addItem(item, 'back'): adds to back
 * - getNextItem('back'): removes and returns from back
 *
 * Double-ended queuer behavior:
 * - addItem(item, position): adds to specified position ('front' or 'back')
 * - getNextItem(position): removes and returns from specified position
 *
 * Processing behavior:
 * - start(): begins processing items in the queuer
 * - stop(): pauses processing
 * - wait: configurable delay between processing items
 * - onUpdate/onGetNextItem: callbacks for monitoring queuer state
 *
 * @example
 * ```ts
 * // FIFO queuer
 * const queuer = new Queuer<number>();
 * queuer.addItem(1); // [1]
 * queuer.addItem(2); // [1, 2]
 * queuer.getNextItem(); // returns 1, queuer is [2]
 *
 * // Priority queuer with processing
 * const priorityQueue = new Queuer<number>({
 *   getPriority: (n) => n, // Higher numbers have priority
 *   started: true, // Begin processing immediately
 *   wait: 1000, // Wait 1s between items
 *   onGetNextItem: (item) => console.log(item)
 * });
 * priorityQueue.addItem(1); // [1]
 * priorityQueue.addItem(3); // [3, 1] - 3 processed first
 * priorityQueue.addItem(2); // [3, 2, 1]
 * ```
 */
export class Queuer<TValue> {
  protected options: Required<QueuerOptions<TValue>>
  private items: Array<TValue> = []
  private executionCount = 0
  private onUpdates: Array<(item: TValue) => void> = []
  private running: boolean
  private pendingTick = false

  constructor(initialOptions: QueuerOptions<TValue> = defaultOptions) {
    this.options = { ...defaultOptions, ...initialOptions }
    this.running = this.options.started

    for (let i = 0; i < this.options.initialItems.length; i++) {
      const item = this.options.initialItems[i]!
      const isLast = i === this.options.initialItems.length - 1
      this.addItem(item, this.options.addItemsTo, isLast)
    }
  }

  /**
   * Processes items in the queuer
   */
  protected tick() {
    if (!this.running) {
      this.pendingTick = false
      return
    }
    while (!this.isEmpty()) {
      const nextItem = this.getNextItem(this.options.getItemsFrom)
      if (nextItem === undefined) {
        break
      }
      this.onUpdates.forEach((cb) => cb(nextItem))

      if (this.options.wait > 0) {
        // Use setTimeout to wait before processing next item
        setTimeout(() => this.tick(), this.options.wait)
        return
      }

      this.tick()
    }
    this.pendingTick = false
  }

  /**
   * Updates the queuer options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<QueuerOptions<TValue>>,
  ): QueuerOptions<TValue> {
    this.options = { ...this.options, ...newOptions }
    return this.options
  }

  /**
   * Adds an item to the queuer and starts processing if not already running
   * @returns true if item was added, false if queuer is full
   */
  addItem(
    item: TValue,
    position: QueuePosition = this.options.addItemsTo,
    runOnUpdate: boolean = true,
  ): boolean {
    if (this.isFull()) {
      return false
    }

    if (this.options.getPriority !== defaultOptions.getPriority) {
      // If custom priority function is provided, insert based on priority
      const priority = this.options.getPriority(item)
      const insertIndex = this.items.findIndex(
        (existing) => this.options.getPriority(existing) > priority,
      )

      if (insertIndex === -1) {
        this.items.push(item)
      } else {
        this.items.splice(insertIndex, 0, item)
      }
    } else {
      // Default FIFO/LIFO behavior
      if (position === 'front') {
        this.items.unshift(item)
      } else {
        this.items.push(item)
      }
    }

    if (this.running && !this.pendingTick) {
      this.pendingTick = true
      this.tick()
    }
    if (runOnUpdate) {
      this.options.onUpdate(this)
    }
    return true
  }

  /**
   * Removes and returns an item from the queuer using shift (default) or pop
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
    position: QueuePosition = this.options.getItemsFrom,
  ): TValue | undefined {
    let item: TValue | undefined

    if (position === 'front') {
      item = this.items.shift()
    } else {
      item = this.items.pop()
    }

    if (item !== undefined) {
      this.executionCount++
      this.options.onUpdate(this)
      this.options.onGetNextItem(item, this)
    }
    return item
  }

  /**
   * Returns an item without removing it
   *
   * @example
   * ```ts
   * // Look at next item to getNextItem
   * queuer.peek()
   * // Look at last item (like stack top)
   * queuer.peek('back')
   * ```
   */
  peek(
    position: QueuePosition = this.options.getItemsFrom,
  ): TValue | undefined {
    if (position === 'front') {
      return this.items[0]
    }
    return this.items[this.items.length - 1]
  }

  /**
   * Returns true if the queuer is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Returns true if the queuer is full
   */
  isFull(): boolean {
    return this.items.length >= this.options.maxSize
  }

  /**
   * Returns the current size of the queuer
   */
  size(): number {
    return this.items.length
  }

  /**
   * Removes all items from the queuer
   */
  clear(): void {
    this.items = []
    this.options.onUpdate(this)
  }

  /**
   * Resets the queuer to its initial state
   */
  reset(withInitialItems?: boolean): void {
    this.clear()
    this.executionCount = 0
    if (withInitialItems) {
      this.items = [...this.options.initialItems]
    }
    this.running = this.options.started
  }

  /**
   * Returns a copy of all items in the queuer
   */
  getAllItems(): Array<TValue> {
    return [...this.items]
  }

  /**
   * Returns the number of items that have been removed from the queuer
   */
  getExecutionCount(): number {
    return this.executionCount
  }

  /**
   * Adds a callback to be called when an item is processed
   */
  onUpdate(cb: (item: TValue) => void) {
    this.onUpdates.push(cb)
    return () => {
      this.onUpdates = this.onUpdates.filter((d) => d !== cb)
    }
  }

  /**
   * Stops the queuer from processing items
   */
  stop() {
    this.running = false
    this.pendingTick = false
    this.options.onUpdate(this)
  }

  /**
   * Starts the queuer and processes items
   */
  start() {
    this.running = true
    if (!this.pendingTick && !this.isEmpty()) {
      this.pendingTick = true
      this.tick()
    }
    this.options.onUpdate(this)
  }

  /**
   * Returns true if the queuer is running
   */
  isRunning() {
    return this.running
  }

  /**
   * Returns true if the queuer is running but has no items to process
   */
  isIdle() {
    return this.running && this.isEmpty()
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
 *   onUpdate: (queuer) => console.log(queuer.getAllItems())
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
export function queue<TValue>(options: QueuerOptions<TValue> = {}) {
  const queuer = new Queuer<TValue>({ ...options, started: true })
  return queuer.addItem.bind(queuer)
}
