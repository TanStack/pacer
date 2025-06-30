import { parseFunctionOrValue } from './utils'

export interface QueuerState<TValue> {
  executionCount: number
  expirationCount: number
  items: Array<TValue>
  itemTimestamps: Array<number>
  rejectionCount: number
  running: boolean
}

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
   * Initial state for the queuer
   */
  initialState?: Partial<QueuerState<TValue>>
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
   * Callback function that is called when the state of the queuer is updated
   */
  onStateChange?: (state: QueuerState<TValue>, queuer: Queuer<TValue>) => void
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

const defaultOptions: Omit<
  Required<QueuerOptions<any>>,
  | 'initialState'
  | 'onStateChange'
  | 'onExecute'
  | 'onIsRunningChange'
  | 'onItemsChange'
  | 'onReject'
  | 'onExpire'
> = {
  addItemsTo: 'back',
  getItemsFrom: 'front',
  getPriority: (item) => item?.priority ?? 0,
  getIsExpired: () => false,
  expirationDuration: Infinity,
  initialItems: [],
  maxSize: Infinity,
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the queuer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count, expiration count, rejection count, and running status
 * - State can be retrieved using `getState()` method
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
  #options: QueuerOptions<TValue>
  #state: QueuerState<TValue> = {
    executionCount: 0,
    expirationCount: 0,
    items: [],
    itemTimestamps: [],
    rejectionCount: 0,
    running: true,
  }
  #onItemsChanges: Array<(item: TValue) => void> = []
  #pendingTick = false
  #timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: (item: TValue) => void,
    initialOptions: QueuerOptions<TValue> = {},
  ) {
    this.#options = { ...defaultOptions, ...initialOptions }
    this.#state = {
      ...this.#state,
      ...this.#options.initialState,
      running:
        this.#options.initialState?.running ?? this.#options.started ?? true,
    }

    if (this.#options.initialState?.items) {
      this.#options.onItemsChange?.(this)
      if (this.#state.running) {
        this.#tick()
      }
    } else {
      for (let i = 0; i < (this.#options.initialItems?.length ?? 0); i++) {
        const item = this.#options.initialItems![i]!
        const isLast = i === (this.#options.initialItems?.length ?? 0) - 1
        this.addItem(item, this.#options.addItemsTo ?? 'back', isLast)
      }
    }

    if (this.#options.started) {
      this.start()
    }
  }

  /**
   * Updates the queuer options. New options are merged with existing options.
   */
  setOptions = (newOptions: Partial<QueuerOptions<TValue>>): void => {
    this.#options = { ...this.#options, ...newOptions }
  }

  /**
   * Returns the current queuer options, including defaults and any overrides.
   */
  getOptions = (): Required<QueuerOptions<TValue>> => {
    return this.#options as Required<QueuerOptions<TValue>>
  }

  getState = (): QueuerState<TValue> => {
    return { ...this.#state }
  }

  #setState = (newState: Partial<QueuerState<TValue>>): void => {
    this.#state = { ...this.#state, ...newState }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Returns the current wait time (in milliseconds) between processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  getWait = (): number => {
    return parseFunctionOrValue(this.#options.wait ?? 0, this)
  }

  /**
   * Processes items in the queue up to the wait interval. Internal use only.
   */
  #tick = () => {
    if (!this.#state.running) {
      this.#pendingTick = false
      return
    }

    // Check for expired items
    this.#checkExpiredItems()

    while (!this.getIsEmpty()) {
      const nextItem = this.execute(this.#options.getItemsFrom ?? 'front')
      if (nextItem === undefined) {
        break
      }
      this.#onItemsChanges.forEach((cb) => cb(nextItem))

      const wait = this.getWait()
      if (wait > 0) {
        // Use setTimeout to wait before processing next item
        this.#timeoutId = setTimeout(() => this.#tick(), wait)
        return
      }

      this.#tick()
    }
    this.#pendingTick = false
  }

  /**
   * Checks for expired items in the queue and removes them. Calls onExpire for each expired item.
   * Internal use only.
   */
  #checkExpiredItems = (): void => {
    if (
      (this.#options.expirationDuration ?? Infinity) === Infinity &&
      this.#options.getIsExpired === defaultOptions.getIsExpired
    )
      return

    const now = Date.now()
    const expiredIndices: Array<number> = []

    // Find indices of expired items
    for (let i = 0; i < this.#state.items.length; i++) {
      const timestamp = this.#state.itemTimestamps[i]
      if (timestamp === undefined) continue

      const item = this.#state.items[i]
      if (item === undefined) continue

      const isExpired =
        this.#options.getIsExpired !== defaultOptions.getIsExpired
          ? this.#options.getIsExpired!(item, timestamp)
          : now - timestamp > (this.#options.expirationDuration ?? Infinity)

      if (isExpired) {
        expiredIndices.push(i)
      }
    }

    // Remove expired items from back to front to maintain indices
    for (let i = expiredIndices.length - 1; i >= 0; i--) {
      const index = expiredIndices[i]
      if (index === undefined) continue

      const expiredItem = this.#state.items[index]
      if (expiredItem === undefined) continue

      this.#state.items.splice(index, 1)
      this.#state.itemTimestamps.splice(index, 1)
      this.#setState({
        expirationCount: this.#state.expirationCount + 1,
      })
      this.#options.onExpire?.(expiredItem, this)
    }

    if (expiredIndices.length > 0) {
      this.#options.onItemsChange?.(this)
    }
  }

  /**
   * Stops processing items in the queue. Does not clear the queue.
   */
  stop = () => {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
    this.#setState({ running: false })
    this.#pendingTick = false
    this.#options.onIsRunningChange?.(this)
  }

  /**
   * Starts processing items in the queue. If already running, does nothing.
   */
  start = () => {
    this.#setState({ running: true })
    if (!this.#pendingTick && !this.getIsEmpty()) {
      this.#pendingTick = true
      this.#tick()
    }
    this.#options.onIsRunningChange?.(this)
  }

  /**
   * Removes all pending items from the queue. Does not affect items being processed.
   */
  clear = (): void => {
    this.#setState({
      items: [],
      itemTimestamps: [],
    })
    this.#options.onItemsChange?.(this)
  }

  /**
   * Resets the queuer to its initial state. Optionally repopulates with initial items.
   * Does not affect callbacks or options.
   */
  reset = (withInitialItems?: boolean): void => {
    this.clear()
    this.#setState({
      executionCount: 0,
      expirationCount: 0,
      rejectionCount: 0,
      running: this.#options.started ?? true,
    })
    if (withInitialItems) {
      this.#setState({
        items: [...(this.#options.initialItems ?? [])],
        itemTimestamps: this.#state.items.map(() => Date.now()),
      })
    }
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
  addItem = (
    item: TValue,
    position: QueuePosition = this.#options.addItemsTo ?? 'back',
    runOnUpdate: boolean = true,
  ): boolean => {
    if (this.getIsFull()) {
      this.#setState({
        rejectionCount: this.#state.rejectionCount + 1,
      })
      this.#options.onReject?.(item, this)
      return false
    }

    if (this.#options.getPriority !== defaultOptions.getPriority) {
      // If custom priority function is provided, insert based on priority
      const priority = this.#options.getPriority!(item)
      const insertIndex = this.#state.items.findIndex(
        (existing) => this.#options.getPriority!(existing) < priority,
      )

      if (insertIndex === -1) {
        this.#state.items.push(item)
        this.#state.itemTimestamps.push(Date.now())
      } else {
        this.#state.items.splice(insertIndex, 0, item)
        this.#state.itemTimestamps.splice(insertIndex, 0, Date.now())
      }
    } else {
      // Default FIFO/LIFO behavior
      if (position === 'front') {
        this.#state.items.unshift(item)
        this.#state.itemTimestamps.unshift(Date.now())
      } else {
        this.#state.items.push(item)
        this.#state.itemTimestamps.push(Date.now())
      }
    }

    if (this.#state.running && !this.#pendingTick) {
      this.#pendingTick = true
      this.#tick()
    }
    if (runOnUpdate) {
      this.#options.onItemsChange?.(this)
    }
    this.#setState({
      items: this.#state.items,
      itemTimestamps: this.#state.itemTimestamps,
    })
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
  getNextItem = (
    position: QueuePosition = this.#options.getItemsFrom ?? 'front',
  ): TValue | undefined => {
    let item: TValue | undefined

    if (position === 'front') {
      item = this.#state.items.shift()
      this.#state.itemTimestamps.shift()
    } else {
      item = this.#state.items.pop()
      this.#state.itemTimestamps.pop()
    }

    if (item !== undefined) {
      this.#options.onItemsChange?.(this)
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
  execute = (position?: QueuePosition): TValue | undefined => {
    const item = this.getNextItem(position)
    if (item !== undefined) {
      this.fn(item)
      this.#setState({
        executionCount: this.#state.executionCount + 1,
      })
      this.#options.onExecute?.(item, this)
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
  peekNextItem = (
    position: QueuePosition = this.#options.getItemsFrom ?? 'front',
  ): TValue | undefined => {
    if (position === 'front') {
      return this.#state.items[0]
    }
    return this.#state.items[this.#state.items.length - 1]
  }

  /**
   * Returns true if the queue is empty (no pending items).
   */
  getIsEmpty = (): boolean => {
    return this.#state.items.length === 0
  }

  /**
   * Returns true if the queue is full (reached maxSize).
   */
  getIsFull = (): boolean => {
    return this.#state.items.length >= (this.#options.maxSize ?? Infinity)
  }

  /**
   * Returns the number of pending items in the queue.
   */
  getSize = (): number => {
    return this.#state.items.length
  }

  /**
   * Returns a copy of all items in the queue.
   */
  peekAllItems = (): Array<TValue> => {
    return [...this.#state.items]
  }

  /**
   * Returns the number of items that have been processed and removed from the queue.
   */
  getExecutionCount = (): number => {
    return this.#state.executionCount
  }

  /**
   * Returns the number of items that have been rejected from being added to the queue.
   */
  getRejectionCount = (): number => {
    return this.#state.rejectionCount
  }

  /**
   * Returns the number of items that have expired and been removed from the queue.
   */
  getExpirationCount = (): number => {
    return this.#state.expirationCount
  }

  /**
   * Returns true if the queuer is currently running (processing items).
   */
  getIsRunning = () => {
    return this.#state.running
  }

  /**
   * Returns true if the queuer is running but has no items to process.
   */
  getIsIdle = () => {
    return this.#state.running && this.getIsEmpty()
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the queuer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes execution count, expiration count, rejection count, and running status
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
