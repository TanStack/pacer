export interface AsyncQueuerOptions<TValue> {
  /**
   * Maximum number of concurrent tasks to process
   */
  concurrency?: number
  /**
   * Function to determine priority of items in the queuer
   * Higher priority items will be processed first
   */
  getPriority?: (item: () => Promise<TValue>) => number
  /**
   * Initial items to populate the queuer with
   */
  initialItems?: Array<() => Promise<TValue>>
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
   * Callback fired whenever an item is added or removed from the queuer
   */
  onUpdate?: (queuer: AsyncQueuer<TValue>) => void
  /**
   * Whether the queuer should start processing tasks immediately
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items
   */
  wait?: number
}

const defaultOptions: Required<AsyncQueuerOptions<any>> = {
  concurrency: 1,
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
  onGetNextItem: () => {},
  onUpdate: () => {},
  started: false,
  wait: 0,
}

/**
 * A flexible asynchronous queuer that processes tasks with configurable concurrency control.
 *
 * Features:
 * - Priority queuer support via getPriority option
 * - Configurable concurrency limit
 * - Task success/error/completion callbacks
 * - FIFO (First In First Out) or LIFO (Last In First Out) queuer behavior
 * - Pause/resume task processing
 * - Task cancellation
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if below the concurrency limit.
 *
 * @example
 * ```ts
 * const queuer = new AsyncQueuer<string>({ concurrency: 2 });
 *
 * queuer.addItem(async () => {
 *   return 'Hello';
 * });
 *
 * queuer.start();
 *
 * queuer.onSuccess((result) => {
 *   console.log(result); // 'Hello'
 * });
 * ```
 */
export class AsyncQueuer<TValue> {
  protected options: Required<AsyncQueuerOptions<TValue>>
  private items: Array<() => Promise<TValue>> = []
  private activeItems: Set<() => Promise<TValue>> = new Set()
  private onSuccessCallbacks: Array<(result: TValue) => void> = []
  private onErrorCallbacks: Array<(error: Error) => void> = []
  private onSettledCallbacks: Array<(result: TValue | Error) => void> = []
  private running: boolean
  private pendingTick = false
  private executionCount = 0

  constructor(initialOptions: AsyncQueuerOptions<TValue> = defaultOptions) {
    this.options = { ...defaultOptions, ...initialOptions }
    this.running = this.options.started

    if (this.options.initialItems.length) {
      this.items = [...this.options.initialItems]

      // Sort initial items if custom priority function is provided
      if (this.options.getPriority !== defaultOptions.getPriority) {
        this.items.sort(
          (a, b) => this.options.getPriority(a) - this.options.getPriority(b),
        )
      }
    }
  }

  /**
   * Updates the queuer options
   * Returns the new options state
   */
  setOptions(
    newOptions: Partial<AsyncQueuerOptions<TValue>>,
  ): AsyncQueuerOptions<TValue> {
    this.options = { ...this.options, ...newOptions }
    return this.options
  }

  /**
   * Processes items in the queuer
   */
  protected tick() {
    if (!this.running) {
      this.pendingTick = false
      return
    }

    while (
      this.activeItems.size < this.options.concurrency &&
      !this.isEmpty()
    ) {
      const nextFn = this.getNextItem()
      if (!nextFn) {
        break
      }

      this.activeItems.add(nextFn)
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
          this.options.onUpdate(this)
        }

        this.activeItems.delete(nextFn)
        if (success) {
          this.onSuccessCallbacks.forEach((cb) => cb(res))
        } else {
          this.onErrorCallbacks.forEach((cb) => cb(error!))
        }
        this.onSettledCallbacks.forEach((cb) => cb(success ? res : error!))

        if (this.options.wait > 0) {
          setTimeout(() => this.tick(), this.options.wait)
          return
        }

        this.tick()
      })()
    }

    this.pendingTick = false
  }

  /**
   * Adds a task to the queuer
   */
  addItem(
    fn: () => Promise<TValue>,
    position: 'front' | 'back' = 'back',
  ): Promise<TValue> {
    if (this.isFull()) {
      return Promise.reject(new Error('Queuer is full'))
    }

    return new Promise<TValue>((resolve, reject) => {
      const task = async () => {
        try {
          const result = await fn()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      }

      if (this.options.getPriority !== defaultOptions.getPriority) {
        // If custom priority function is provided, insert based on priority
        const priority = this.options.getPriority(task)
        const insertIndex = this.items.findIndex(
          (existing) => this.options.getPriority(existing) > priority,
        )

        if (insertIndex === -1) {
          this.items.push(task)
        } else {
          this.items.splice(insertIndex, 0, task)
        }
      } else {
        // Default FIFO/LIFO behavior
        if (position === 'front') {
          this.items.unshift(task)
        } else {
          this.items.push(task)
        }
      }

      this.options.onUpdate(this)

      if (this.running && !this.pendingTick) {
        this.pendingTick = true
        this.tick()
      }
    })
  }

  /**
   * Removes and returns an item from the queuer
   */
  getNextItem(
    position: 'front' | 'back' = 'front',
  ): (() => Promise<TValue>) | undefined {
    let item: (() => Promise<TValue>) | undefined

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
   */
  peek(
    position: 'front' | 'back' = 'front',
  ): (() => Promise<TValue>) | undefined {
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
  getAllItems(): Array<() => Promise<TValue>> {
    return [...this.items]
  }

  /**
   * Returns the number of items that have been removed from the queuer
   */
  getExecutionCount(): number {
    return this.executionCount
  }

  /**
   * Returns the active items
   */
  getActiveItems(): Array<() => Promise<TValue>> {
    return Array.from(this.activeItems)
  }

  /**
   * Returns the pending items
   */
  getPendingItems(): Array<() => Promise<TValue>> {
    return this.getAllItems()
  }

  /**
   * Adds a callback to be called when a task succeeds
   */
  onSuccess(cb: (result: TValue) => void) {
    this.onSuccessCallbacks.push(cb)
    return () => {
      this.onSuccessCallbacks = this.onSuccessCallbacks.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task errors
   */
  onError(cb: (error: Error) => void) {
    this.onErrorCallbacks.push(cb)
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task is settled
   */
  onSettled(cb: (result: TValue | Error) => void) {
    this.onSettledCallbacks.push(cb)
    return () => {
      this.onSettledCallbacks = this.onSettledCallbacks.filter((d) => d !== cb)
    }
  }

  /**
   * Starts the queuer and processes items
   */
  start(): Promise<void> {
    this.running = true
    if (!this.pendingTick && !this.isEmpty()) {
      this.pendingTick = true
      this.tick()
    }
    this.options.onUpdate(this)

    return new Promise<void>((resolve) => {
      const checkIdle = () => {
        if (this.isIdle()) {
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
    this.running = false
    this.pendingTick = false
    this.options.onUpdate(this)
  }

  /**
   * Returns true if the queuer is running
   */
  isRunning(): boolean {
    return this.running
  }

  /**
   * Returns true if the queuer is running but has no items to process
   */
  isIdle(): boolean {
    return this.running && this.isEmpty() && this.activeItems.size === 0
  }

  /**
   * Throttles the number of concurrent items that can run at once
   */
  throttle(n: number): void {
    this.options.concurrency = n
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
export function asyncQueue<TValue>(options: AsyncQueuerOptions<TValue> = {}) {
  const queuer = new AsyncQueuer<TValue>({ ...options, started: true })
  return queuer.addItem.bind(queuer)
}
