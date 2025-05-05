import type { QueuePosition } from './queuer'

export interface AsyncQueuerOptions<TValue> {
  /**
   * Default position to add items to the queuer
   * @default 'back'
   */
  addItemsTo?: QueuePosition
  /**
   * Maximum number of concurrent tasks to process
   */
  concurrency?: number
  /**
   * Maximum time in milliseconds that an item can stay in the queue
   * If not provided, items will never expire
   */
  expirationDuration?: number
  /**
   * Function to determine if an item has expired
   * If provided, this overrides the expirationDuration behavior
   */
  getIsExpired?: (item: () => Promise<TValue>, addedAt: number) => boolean
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
  getPriority?: (item: () => Promise<TValue>) => number
  /**
   * Initial items to populate the queuer with
   */
  initialItems?: Array<(() => Promise<TValue>) & { priority?: number }>
  /**
   * Maximum number of items allowed in the queuer
   */
  maxSize?: number
  /**
   * Callback fired whenever an item is removed from the queuer
   */
  onGetNextItem?: (
    item: () => Promise<TValue>,
    queuer: AsyncQueuer<TValue>,
  ) => void
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
  onReject?: (item: () => Promise<TValue>, queuer: AsyncQueuer<TValue>) => void
  /**
   * Callback fired whenever an item expires in the queuer
   */
  onExpire?: (item: () => Promise<TValue>, queuer: AsyncQueuer<TValue>) => void
  /**
   * Whether the queuer should start processing tasks immediately or not.
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items
   */
  wait?: number
}

const defaultOptions: Required<AsyncQueuerOptions<any>> = {
  addItemsTo: 'back',
  concurrency: 1,
  expirationDuration: Infinity,
  getIsExpired: () => false,
  getItemsFrom: 'front',
  getPriority: (item) => (item as any)?.priority ?? 0,
  initialItems: [],
  maxSize: Infinity,
  onGetNextItem: () => {},
  onIsRunningChange: () => {},
  onItemsChange: () => {},
  onReject: () => {},
  onExpire: () => {},
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
 * @example
 * ```ts
 * const asyncQueuer = new AsyncQueuer<string>({ concurrency: 2 });
 *
 * asyncQueuer.addItem(async () => {
 *   return 'Hello';
 * });
 *
 * asyncQueuer.start();
 *
 * asyncQueuer.onSuccess((result) => {
 *   console.log(result); // 'Hello'
 * });
 * ```
 */
export class AsyncQueuer<TValue> {
  private _options: Required<AsyncQueuerOptions<TValue>>
  private _activeItems: Set<() => Promise<TValue>> = new Set()
  private _executionCount = 0
  private _rejectionCount = 0
  private _expirationCount = 0
  private _items: Array<() => Promise<TValue>> = []
  private _itemTimestamps: Array<number> = []
  private _onErrorCallbacks: Array<(error: Error) => void> = []
  private _onSettledCallbacks: Array<(result: TValue | Error) => void> = []
  private _onSuccessCallbacks: Array<(result: TValue) => void> = []
  private _pendingTick = false
  private _running: boolean

  constructor(initialOptions: AsyncQueuerOptions<TValue> = defaultOptions) {
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
   * Returns the new options state
   */
  setOptions(newOptions: Partial<AsyncQueuerOptions<TValue>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current queuer options
   */
  getOptions(): Required<AsyncQueuerOptions<TValue>> {
    return this._options
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
      this._activeItems.size < this._options.concurrency &&
      !this.getIsEmpty()
    ) {
      const nextFn = this.getNextItem()
      if (!nextFn) {
        break
      }
      this._activeItems.add(nextFn)
      this._options.onItemsChange(this)
      ;(async () => {
        let success = false
        let res!: TValue
        let error: Error | undefined

        try {
          res = await nextFn()
          success = true
        } catch (e) {
          error = e as Error
        } finally {
          this._activeItems.delete(nextFn)
          this._options.onItemsChange(this)
        }

        if (success) {
          this._onSuccessCallbacks.forEach((cb) => cb(res))
        } else {
          this._onErrorCallbacks.forEach((cb) => cb(error!))
        }
        this._onSettledCallbacks.forEach((cb) => cb(success ? res : error!))

        if (this._options.wait > 0) {
          setTimeout(() => this.tick(), this._options.wait)
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
   * Starts the queuer and processes items
   */
  start(): Promise<void> {
    this._running = true
    if (!this._pendingTick && !this.getIsEmpty()) {
      this._pendingTick = true
      this.tick()
    }
    this._options.onIsRunningChange(this)

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
   * Adds a task to the queuer
   */
  addItem(
    fn: (() => Promise<TValue>) & { priority?: number },
    position: QueuePosition = this._options.addItemsTo,
    runOnUpdate: boolean = true,
  ): Promise<TValue> {
    if (this.getIsFull()) {
      this._rejectionCount++
      this._options.onReject(fn, this)
      return Promise.reject(new Error('Queuer is full'))
    }

    return new Promise<TValue>((resolve, reject) => {
      const task = Object.assign(
        async () => {
          try {
            const result = await fn()
            resolve(result)
            return result
          } catch (error) {
            reject(error)
            throw error
          }
        },
        { priority: fn.priority ?? undefined },
      )

      // Get priority either from the function or from getPriority option
      const priority =
        this._options.getPriority !== defaultOptions.getPriority
          ? this._options.getPriority(task)
          : task.priority

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
          this._items.push(task)
          this._itemTimestamps.push(Date.now())
        } else {
          this._items.splice(insertIndex, 0, task)
          this._itemTimestamps.splice(insertIndex, 0, Date.now())
        }
      } else {
        // Default FIFO/LIFO behavior
        if (position === 'front') {
          this._items.unshift(task)
          this._itemTimestamps.unshift(Date.now())
        } else {
          this._items.push(task)
          this._itemTimestamps.push(Date.now())
        }
      }

      if (runOnUpdate) {
        this._options.onItemsChange(this)
      }

      if (this._running && !this._pendingTick) {
        this._pendingTick = true
        this.tick()
      }
    })
  }

  /**
   * Removes and returns an item from the queuer
   */
  getNextItem(
    position: QueuePosition = this._options.getItemsFrom,
  ): (() => Promise<TValue>) | undefined {
    let item: (() => Promise<TValue>) | undefined

    if (position === 'front') {
      item = this._items.shift()
      this._itemTimestamps.shift()
    } else {
      item = this._items.pop()
      this._itemTimestamps.pop()
    }

    if (item !== undefined) {
      this._executionCount++
      this._options.onItemsChange(this)
      this._options.onGetNextItem(item, this)
    }
    return item
  }

  /**
   * Returns an item without removing it
   */
  getPeek(
    position: QueuePosition = 'front',
  ): (() => Promise<TValue>) | undefined {
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
  getAllItems(): Array<() => Promise<TValue>> {
    return [...this.getActiveItems(), ...this.getPendingItems()]
  }

  /**
   * Returns the active items
   */
  getActiveItems(): Array<() => Promise<TValue>> {
    return Array.from(this._activeItems)
  }

  /**
   * Returns the pending items
   */
  getPendingItems(): Array<() => Promise<TValue>> {
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
   * Adds a callback to be called when a task succeeds
   */
  onSuccess(cb: (result: TValue) => void) {
    this._onSuccessCallbacks.push(cb)
    return () => {
      this._onSuccessCallbacks = this._onSuccessCallbacks.filter(
        (d) => d !== cb,
      )
    }
  }

  /**
   * Adds a callback to be called when a task errors
   */
  onError(cb: (error: Error) => void) {
    this._onErrorCallbacks.push(cb)
    return () => {
      this._onErrorCallbacks = this._onErrorCallbacks.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task is settled
   */
  onSettled(cb: (result: TValue | Error) => void) {
    this._onSettledCallbacks.push(cb)
    return () => {
      this._onSettledCallbacks = this._onSettledCallbacks.filter(
        (d) => d !== cb,
      )
    }
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
export function asyncQueue<TValue>(
  options: Omit<AsyncQueuerOptions<TValue>, 'started'> = {},
) {
  const queuer = new AsyncQueuer<TValue>(options)
  return queuer.addItem.bind(queuer)
}
