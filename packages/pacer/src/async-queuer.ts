import { parseFunctionOrValue } from './utils'
import type { OptionalKeys } from './types'
import type { QueuePosition } from './queuer'

export interface AsyncQueuerState<TValue> {
  activeItems: Array<TValue>
  errorCount: number
  expirationCount: number
  items: Array<TValue>
  itemTimestamps: Array<number>
  lastResult: any
  rejectionCount: number
  running: boolean
  settledCount: number
  successCount: number
}

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
   * Initial state for the async queuer
   */
  initialState?: Partial<AsyncQueuerState<TValue>>
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
   * Callback function that is called when the state of the async queuer is updated
   */
  onStateChange?: (
    state: AsyncQueuerState<TValue>,
    queuer: AsyncQueuer<TValue>,
  ) => void
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
  | 'initialState'
  | 'throwOnError'
  | 'onSuccess'
  | 'onSettled'
  | 'onReject'
  | 'onItemsChange'
  | 'onIsRunningChange'
  | 'onExpire'
  | 'onError'
  | 'onStateChange'
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async queuer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes error count, expiration count, rejection count, running status, and success/settle counts
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
  #options: AsyncQueuerOptions<TValue>
  #state: AsyncQueuerState<TValue> = {
    activeItems: [],
    errorCount: 0,
    expirationCount: 0,
    items: [],
    itemTimestamps: [],
    lastResult: null,
    rejectionCount: 0,
    running: true,
    settledCount: 0,
    successCount: 0,
  }
  #pendingTick = false

  constructor(
    private fn: (value: TValue) => Promise<any>,
    initialOptions: AsyncQueuerOptions<TValue>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
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
  }

  /**
   * Updates the queuer options. New options are merged with existing options.
   */
  setOptions(newOptions: Partial<AsyncQueuerOptions<TValue>>): void {
    this.#options = { ...this.#options, ...newOptions }
  }

  /**
   * Returns the current queuer options, including defaults and any overrides.
   */
  getOptions(): AsyncQueuerOptions<TValue> {
    return this.#options
  }

  getState(): AsyncQueuerState<TValue> {
    return { ...this.#state }
  }

  #setState(newState: Partial<AsyncQueuerState<TValue>>): void {
    this.#state = { ...this.#state, ...newState }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Returns the current wait time (in milliseconds) between processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  getWait(): number {
    return parseFunctionOrValue(this.#options.wait ?? 0, this)
  }

  /**
   * Returns the current concurrency limit for processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  getConcurrency(): number {
    return parseFunctionOrValue(this.#options.concurrency ?? 1, this)
  }

  /**
   * Processes items in the queue up to the concurrency limit. Internal use only.
   */
  #tick() {
    if (!this.#state.running) {
      this.#pendingTick = false
      return
    }

    // Check for expired items
    this.#checkExpiredItems()

    // Process items concurrently up to the concurrency limit
    while (
      this.#state.activeItems.length < this.getConcurrency() &&
      !this.getIsEmpty()
    ) {
      const nextItem = this.peekNextItem()
      if (!nextItem) {
        break
      }
      this.#setState({
        activeItems: [...this.#state.activeItems, nextItem],
      })
      this.#options.onItemsChange?.(this)
      ;(async () => {
        const result = await this.execute()
        this.#setState({ lastResult: result })

        const wait = this.getWait()
        if (wait > 0) {
          setTimeout(() => this.#tick(), wait)
          return
        }

        this.#tick()
      })()
    }

    this.#pendingTick = false
  }

  /**
   * Starts processing items in the queue. If already running, does nothing.
   */
  start(): void {
    this.#setState({ running: true })
    if (!this.#pendingTick && !this.getIsEmpty()) {
      this.#pendingTick = true
      this.#tick()
    }
    this.#options.onIsRunningChange?.(this)
  }

  /**
   * Stops processing items in the queue. Does not clear the queue.
   */
  stop(): void {
    this.#setState({ running: false })
    this.#pendingTick = false
    this.#options.onIsRunningChange?.(this)
  }

  /**
   * Removes all pending items from the queue. Does not affect active tasks.
   */
  clear(): void {
    this.#setState({ items: [], itemTimestamps: [] })
    this.#options.onItemsChange?.(this)
  }

  /**
   * Resets the queuer to its initial state. Optionally repopulates with initial items.
   * Does not affect callbacks or options.
   */
  reset(withInitialItems?: boolean): void {
    this.clear()
    this.#setState({
      activeItems: [],
      errorCount: 0,
      expirationCount: 0,
      lastResult: null,
      rejectionCount: 0,
      settledCount: 0,
      successCount: 0,
      running: this.#options.started ?? true,
    })
    if (withInitialItems) {
      const items = [...(this.#options.initialItems ?? [])]
      this.#setState({
        items,
        itemTimestamps: items.map(() => Date.now()),
      })
    }
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
    position: QueuePosition = this.#options.addItemsTo ?? 'back',
    runOnItemsChange: boolean = true,
  ): void {
    if (this.getIsFull()) {
      this.#setState({
        rejectionCount: this.#state.rejectionCount + 1,
      })
      this.#options.onReject?.(item, this)
      return
    }

    // Get priority either from the function or from getPriority option
    const priority =
      this.#options.getPriority !== defaultOptions.getPriority
        ? this.#options.getPriority!(item)
        : item.priority

    if (priority !== undefined) {
      // Insert based on priority - higher priority items go to front
      const insertIndex = this.#state.items.findIndex((existing) => {
        const existingPriority =
          this.#options.getPriority !== defaultOptions.getPriority
            ? this.#options.getPriority!(existing)
            : (existing as any).priority
        return existingPriority < priority
      })

      if (insertIndex === -1) {
        this.#setState({
          items: [...this.#state.items, item],
          itemTimestamps: [...this.#state.itemTimestamps, Date.now()],
        })
      } else {
        const newItems = [...this.#state.items]
        const newTimestamps = [...this.#state.itemTimestamps]
        newItems.splice(insertIndex, 0, item)
        newTimestamps.splice(insertIndex, 0, Date.now())
        this.#setState({
          items: newItems,
          itemTimestamps: newTimestamps,
        })
      }
    } else {
      if (position === 'front') {
        // Default FIFO/LIFO behavior
        this.#setState({
          items: [item, ...this.#state.items],
          itemTimestamps: [Date.now(), ...this.#state.itemTimestamps],
        })
      } else {
        // LIFO
        this.#setState({
          items: [...this.#state.items, item],
          itemTimestamps: [...this.#state.itemTimestamps, Date.now()],
        })
      }
    }

    if (runOnItemsChange) {
      this.#options.onItemsChange?.(this)
    }

    if (this.#state.running && !this.#pendingTick) {
      this.#pendingTick = true
      this.#tick()
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
    position: QueuePosition = this.#options.getItemsFrom ?? 'front',
  ): TValue | undefined {
    let item: TValue | undefined

    if (position === 'front') {
      item = this.#state.items[0]
      if (item !== undefined) {
        this.#setState({
          items: this.#state.items.slice(1),
          itemTimestamps: this.#state.itemTimestamps.slice(1),
        })
      }
    } else {
      item = this.#state.items[this.#state.items.length - 1]
      if (item !== undefined) {
        this.#setState({
          items: this.#state.items.slice(0, -1),
          itemTimestamps: this.#state.itemTimestamps.slice(0, -1),
        })
      }
    }

    if (item !== undefined) {
      this.#options.onItemsChange?.(this)
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
        const result = await this.fn(item)
        this.#setState({
          lastResult: result,
          successCount: this.#state.successCount + 1,
        })
        this.#options.onSuccess?.(result, this)
      } catch (error) {
        this.#setState({
          errorCount: this.#state.errorCount + 1,
        })
        this.#options.onError?.(error, this)
        if (this.#options.throwOnError) {
          throw error
        }
      } finally {
        this.#setState({
          activeItems: this.#state.activeItems.filter(
            (activeItem) => activeItem !== item,
          ),
          settledCount: this.#state.settledCount + 1,
        })
        this.#options.onItemsChange?.(this)
        this.#options.onSettled?.(this)
      }
    }
    return item
  }

  /**
   * Checks for expired items in the queue and removes them. Calls onExpire for each expired item.
   * Internal use only.
   */
  #checkExpiredItems(): void {
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

      const newItems = [...this.#state.items]
      const newTimestamps = [...this.#state.itemTimestamps]
      newItems.splice(index, 1)
      newTimestamps.splice(index, 1)
      this.#setState({
        items: newItems,
        itemTimestamps: newTimestamps,
        expirationCount: this.#state.expirationCount + 1,
      })
      this.#options.onExpire?.(expiredItem, this)
    }

    if (expiredIndices.length > 0) {
      this.#options.onItemsChange?.(this)
    }
  }

  /**
   * Returns the next item in the queue without removing it.
   *
   * @example
   * ```ts
   * queuer.peekNextItem(); // front
   * queuer.peekNextItem('back'); // back
   * ```
   */
  peekNextItem(position: QueuePosition = 'front'): TValue | undefined {
    if (position === 'front') {
      return this.#state.items[0]
    }
    return this.#state.items[this.#state.items.length - 1]
  }

  /**
   * Returns true if the queue is empty (no pending items).
   */
  getIsEmpty(): boolean {
    return this.#state.items.length === 0
  }

  /**
   * Returns true if the queue is full (reached maxSize).
   */
  getIsFull(): boolean {
    return this.#state.items.length >= (this.#options.maxSize ?? Infinity)
  }

  /**
   * Returns the number of pending items in the queue.
   */
  getSize(): number {
    return this.#state.items.length
  }

  /**
   * Returns a copy of all items in the queue, including active and pending items.
   */
  peekAllItems(): Array<TValue> {
    return [...this.peekActiveItems(), ...this.peekPendingItems()]
  }

  /**
   * Returns the items currently being processed (active tasks).
   */
  peekActiveItems(): Array<TValue> {
    return [...this.#state.activeItems]
  }

  /**
   * Returns the items waiting to be processed (pending tasks).
   */
  peekPendingItems(): Array<TValue> {
    return [...this.#state.items]
  }

  /**
   * Returns the number of items that have been successfully processed.
   */
  getSuccessCount(): number {
    return this.#state.successCount
  }

  /**
   * Returns the number of items that have failed processing.
   */
  getErrorCount(): number {
    return this.#state.errorCount
  }

  /**
   * Returns the number of items that have completed processing (success or error).
   */
  getSettledCount(): number {
    return this.#state.settledCount
  }

  /**
   * Returns the number of items that have been rejected from being added to the queue.
   */
  getRejectionCount(): number {
    return this.#state.rejectionCount
  }

  /**
   * Returns true if the queuer is currently running (processing items).
   */
  getIsRunning(): boolean {
    return this.#state.running
  }

  /**
   * Returns true if the queuer is running but has no items to process and no active tasks.
   */
  getIsIdle(): boolean {
    return (
      this.#state.running &&
      this.getIsEmpty() &&
      this.#state.activeItems.length === 0
    )
  }

  /**
   * Returns the number of items that have expired and been removed from the queue.
   */
  getExpirationCount(): number {
    return this.#state.expirationCount
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async queuer
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes error count, expiration count, rejection count, running status, and success/settle counts
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
