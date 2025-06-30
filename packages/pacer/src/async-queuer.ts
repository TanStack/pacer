import { Store } from '@tanstack/store'
import { parseFunctionOrValue } from './utils'
import type { OptionalKeys } from './types'
import type { QueuePosition } from './queuer'

export interface AsyncQueuerState<TValue> {
  activeItems: Array<TValue>
  errorCount: number
  expirationCount: number
  isEmpty: boolean
  isFull: boolean
  isIdle: boolean
  isRunning: boolean
  itemTimestamps: Array<number>
  items: Array<TValue>
  lastResult: any
  pendingTick: boolean
  rejectionCount: number
  settledCount: number
  size: number
  status: 'idle' | 'running' | 'stopped'
  successCount: number
}

function getDefaultAsyncQueuerState<TValue>(): AsyncQueuerState<TValue> {
  return structuredClone({
    activeItems: [],
    errorCount: 0,
    expirationCount: 0,
    isEmpty: true,
    isFull: false,
    isIdle: true,
    isRunning: true,
    itemTimestamps: [],
    items: [],
    lastResult: null,
    pendingTick: false,
    rejectionCount: 0,
    settledCount: 0,
    size: 0,
    status: 'idle',
    successCount: 0,
  })
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
  | 'initialState'
  | 'throwOnError'
  | 'onSuccess'
  | 'onSettled'
  | 'onReject'
  | 'onItemsChange'
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
  readonly store: Store<AsyncQueuerState<TValue>> = new Store<
    AsyncQueuerState<TValue>
  >(getDefaultAsyncQueuerState<TValue>())
  #options: AsyncQueuerOptions<TValue>

  constructor(
    private fn: (value: TValue) => Promise<any>,
    initialOptions: AsyncQueuerOptions<TValue>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    const isInitiallyRunning =
      this.#options.initialState?.isRunning ?? this.#options.started ?? true
    this.#setState({
      ...this.#options.initialState,
      isRunning: isInitiallyRunning,
    })

    if (this.#options.initialState?.items) {
      if (this.store.state.isRunning) {
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

  #setState(newState: Partial<AsyncQueuerState<TValue>>): void {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }

      const { activeItems, items, isRunning } = combinedState

      const size = items.length
      const isFull = size >= (this.#options.maxSize ?? Infinity)
      const isEmpty = size === 0
      const isIdle = isRunning && isEmpty && activeItems.length === 0

      const status = isIdle ? 'idle' : isRunning ? 'running' : 'stopped'

      return {
        ...combinedState,
        isEmpty,
        isFull,
        isIdle,
        size,
        status,
      }
    })
  }

  /**
   * Returns the current wait time (in milliseconds) between processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  #getWait(): number {
    return parseFunctionOrValue(this.#options.wait ?? 0, this)
  }

  /**
   * Returns the current concurrency limit for processing items.
   * If a function is provided, it is called with the queuer instance.
   */
  #getConcurrency(): number {
    return parseFunctionOrValue(this.#options.concurrency ?? 1, this)
  }

  /**
   * Processes items in the queue up to the concurrency limit. Internal use only.
   */
  #tick() {
    if (!this.store.state.isRunning) {
      this.#setState({ pendingTick: false })
      return
    }

    // Check for expired items
    this.#checkExpiredItems()

    // Process items concurrently up to the concurrency limit
    const activeItems = this.store.state.activeItems
    while (
      activeItems.length < this.#getConcurrency() &&
      !this.store.state.isEmpty
    ) {
      const nextItem = this.peekNextItem()
      if (!nextItem) {
        break
      }
      activeItems.push(nextItem)
      this.#setState({
        activeItems,
      })
      ;(async () => {
        const result = await this.execute()
        this.#setState({ lastResult: result })

        const wait = this.#getWait()
        if (wait > 0) {
          setTimeout(() => this.#tick(), wait)
          return
        }

        this.#tick()
      })()
    }

    this.#setState({ pendingTick: false })
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
    if (this.store.state.isFull) {
      this.#setState({
        rejectionCount: this.store.state.rejectionCount + 1,
      })
      this.#options.onReject?.(item, this)
      return
    }

    // Get priority either from the function or from getPriority option
    const priority =
      this.#options.getPriority !== defaultOptions.getPriority
        ? this.#options.getPriority!(item)
        : item.priority

    const items = this.store.state.items
    const itemTimestamps = this.store.state.itemTimestamps

    if (priority !== undefined) {
      // Insert based on priority - higher priority items go to front
      const insertIndex = items.findIndex((existing) => {
        const existingPriority =
          this.#options.getPriority !== defaultOptions.getPriority
            ? this.#options.getPriority!(existing)
            : (existing as any).priority
        return existingPriority < priority
      })

      if (insertIndex === -1) {
        items.push(item)
        itemTimestamps.push(Date.now())
      } else {
        items.splice(insertIndex, 0, item)
        itemTimestamps.splice(insertIndex, 0, Date.now())
      }
    } else {
      if (position === 'front') {
        // Default FIFO/LIFO behavior
        items.unshift(item)
        itemTimestamps.unshift(Date.now())
      } else {
        // LIFO
        items.push(item)
        itemTimestamps.push(Date.now())
      }
    }

    this.#setState({
      items,
      itemTimestamps,
    })

    if (runOnItemsChange) {
      this.#options.onItemsChange?.(this)
    }

    if (this.store.state.isRunning && !this.store.state.pendingTick) {
      this.#setState({ pendingTick: true })
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
    const items = this.store.state.items
    const itemTimestamps = this.store.state.itemTimestamps
    let item: TValue | undefined

    if (position === 'front') {
      item = items[0]
      if (item !== undefined) {
        this.#setState({
          items: items.slice(1),
          itemTimestamps: itemTimestamps.slice(1),
        })
      }
    } else {
      item = items[items.length - 1]
      if (item !== undefined) {
        this.#setState({
          items: items.slice(0, -1),
          itemTimestamps: itemTimestamps.slice(0, -1),
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
        const lastResult = await this.fn(item)
        this.#setState({
          successCount: this.store.state.successCount + 1,
          lastResult,
        })
        this.#options.onSuccess?.(lastResult, this)
      } catch (error) {
        this.#setState({
          errorCount: this.store.state.errorCount + 1,
        })
        this.#options.onError?.(error, this)
        if (this.#options.throwOnError) {
          throw error
        }
      } finally {
        this.#setState({
          activeItems: this.store.state.activeItems.filter(
            (activeItem) => activeItem !== item,
          ),
          settledCount: this.store.state.settledCount + 1,
        })
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
    for (let i = 0; i < this.store.state.size; i++) {
      const timestamp = this.store.state.itemTimestamps[i]
      if (timestamp === undefined) continue

      const item = this.store.state.items[i]
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

      const expiredItem = this.store.state.items[index]
      if (expiredItem === undefined) continue

      const newItems = [...this.store.state.items]
      const newTimestamps = [...this.store.state.itemTimestamps]
      newItems.splice(index, 1)
      newTimestamps.splice(index, 1)
      this.#setState({
        items: newItems,
        itemTimestamps: newTimestamps,
        expirationCount: this.store.state.expirationCount + 1,
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
      return this.store.state.items[0]
    }
    return this.store.state.items[this.store.state.size - 1]
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
    return [...this.store.state.activeItems]
  }

  /**
   * Returns the items waiting to be processed (pending tasks).
   */
  peekPendingItems(): Array<TValue> {
    return [...this.store.state.items]
  }

  /**
   * Starts processing items in the queue. If already running, does nothing.
   */
  start(): void {
    this.#setState({ isRunning: true })
    if (!this.store.state.pendingTick && !this.store.state.isEmpty) {
      this.#setState({ pendingTick: true })
      this.#tick()
    }
  }

  /**
   * Stops processing items in the queue. Does not clear the queue.
   */
  stop(): void {
    this.#setState({ isRunning: false, pendingTick: false })
  }

  /**
   * Removes all pending items from the queue. Does not affect active tasks.
   */
  clear(): void {
    this.#setState({ items: [], itemTimestamps: [] })
    this.#options.onItemsChange?.(this)
  }

  /**
   * Resets the queuer state to its default values
   */
  reset(): void {
    this.#setState(getDefaultAsyncQueuerState<TValue>())
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
