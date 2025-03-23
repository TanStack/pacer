/**
 * Options for configuring a Queue instance
 */
export interface QueueOptions<TValue> {
  /**
   * Initial items to populate the queue with
   */
  initialItems?: Array<TValue>
  /**
   * Maximum number of items allowed in the queue
   */
  maxSize?: number
  /**
   * Callback fired whenever an item is added or removed from the queue
   */
  onUpdate?: (queue: Queue<TValue>) => void
  /**
   * Function to determine priority of items in the queue
   * Higher priority items will be processed first
   */
  getPriority?: (item: TValue) => number
}

const defaultOptions: Required<QueueOptions<any>> = {
  initialItems: [],
  maxSize: Infinity,
  onUpdate: () => {},
  getPriority: () => 0,
}

/**
 * Position type for addItem and getNextItem operations
 */
export type QueuePosition = 'front' | 'back'

/**
 * A flexible queue data structure that defaults to FIFO (First In First Out) behavior
 * with optional position overrides for stack-like or double-ended operations.
 *
 * Supports priority-based ordering when a getPriority function is provided.
 * Items with higher priority values will be processed first.
 *
 * A queue does not have automatic queueing of items. This expects you to hook up the `addItem` and `getNextItem` events.
 * For automatic queueing with start and stop, use the `Queuer` class.
 *
 * Default queue behavior:
 * - addItem(item): adds to back of queue
 * - getNextItem(): removes and returns from front of queue
 *
 * Stack (LIFO) behavior:
 * - addItem(item, 'back'): adds to back
 * - getNextItem('back'): removes and returns from back
 *
 * Double-ended queue behavior:
 * - addItem(item, position): adds to specified position ('front' or 'back')
 * - getNextItem(position): removes and returns from specified position
 *
 * @example
 * ```ts
 * // FIFO queue
 * const queue = new Queue<number>();
 * queue.addItem(1); // [1]
 * queue.addItem(2); // [1, 2]
 * queue.getNextItem(); // returns 1, queue is [2]
 *
 * // Priority queue
 * const priorityQueue = new Queue<number>({
 *   getPriority: (n) => n // Higher numbers have priority
 * });
 * priorityQueue.addItem(1); // [1]
 * priorityQueue.addItem(3); // [3, 1]
 * priorityQueue.addItem(2); // [3, 2, 1]
 * ```
 */
export class Queue<TValue> {
  protected options: Required<QueueOptions<TValue>> = defaultOptions
  private items: Array<TValue> = []
  private executionCount = 0

  constructor(options: QueueOptions<TValue> = defaultOptions) {
    this.options = { ...defaultOptions, ...options }

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
   * Adds an item to the queue
   *
   * @example
   * ```ts
   * // Standard FIFO queue
   * queue.addItem(item)
   * // Add to front (like unshift)
   * queue.addItem(item, 'front')
   * ```
   */
  addItem(item: TValue, position: QueuePosition = 'back'): boolean {
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

    this.options.onUpdate(this)
    return true
  }

  /**
   * Removes and returns an item from the queue using shift (default) or pop
   *
   * @example
   * ```ts
   * // Standard FIFO queue
   * queue.getNextItem()
   * // Stack-like behavior (LIFO)
   * queue.getNextItem('back')
   * ```
   */
  getNextItem(position: QueuePosition = 'front'): TValue | undefined {
    let item: TValue | undefined

    if (position === 'front') {
      item = this.items.shift()
    } else {
      item = this.items.pop()
    }

    if (item !== undefined) {
      this.executionCount++
      this.options.onUpdate(this)
    }
    return item
  }

  /**
   * Returns an item without removing it
   *
   * @example
   * ```ts
   * // Look at next item to getNextItem
   * queue.peek()
   * // Look at last item (like stack top)
   * queue.peek('back')
   * ```
   */
  peek(position: QueuePosition = 'front'): TValue | undefined {
    if (position === 'front') {
      return this.items[0]
    }
    return this.items[this.items.length - 1]
  }

  /**
   * Returns true if the queue is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Returns true if the queue is full
   */
  isFull(): boolean {
    return this.items.length >= this.options.maxSize
  }

  /**
   * Returns the current size of the queue
   */
  size(): number {
    return this.items.length
  }

  /**
   * Removes all items from the queue
   */
  clear(): void {
    this.items = []
    this.options.onUpdate(this)
  }

  /**
   * Resets the queue to its initial state
   */
  reset(withInitialItems?: boolean): void {
    this.clear()
    this.executionCount = 0
    if (withInitialItems) {
      this.items = [...this.options.initialItems]
    }
  }

  /**
   * Returns a copy of all items in the queue
   */
  getAllItems(): Array<TValue> {
    return [...this.items]
  }

  /**
   * Returns the number of items that have been removed from the queue
   */
  getExecutionCount(): number {
    return this.executionCount
  }
}
