export interface QueueOptions<TValue> {
  initialItems?: Array<TValue>
  maxSize?: number
  onUpdate?: (queue: Queue<TValue>) => void
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
 * Default queue behavior:
 * - addItem(item): adds to back
 * - getNextItem(): removes from front
 *
 * Stack behavior (using position override):
 * - addItem(item, 'back'): LIFO (Last In First Out)
 * - getNextItem('back'): LIFO (Last In First Out)
 *
 * Double-ended behavior:
 * - addItem(item, 'front' | 'back')
 * - getNextItem('front' | 'back')
 */
export class Queue<TValue> {
  private items: Array<TValue> = []
  private options: Required<QueueOptions<TValue>>

  constructor(options: QueueOptions<TValue> = defaultOptions) {
    this.options = {
      ...defaultOptions,
      ...options,
    }

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
   * @param item The item to add
   * @param position Where to add the item (defaults to back for standard FIFO behavior). Don't use this argument unless you want to use a stack or double-ended queue.
   * @returns false if queue is full, true if item was added
   *
   * Examples:
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
   * @param position Where to remove the item from (defaults to front for standard FIFO behavior)
   * @returns the removed item or undefined if empty
   *
   * Examples:
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
      this.options.onUpdate(this)
    }
    return item
  }

  /**
   * Returns an item without removing it
   * @param position Which item to peek at (defaults to front for standard FIFO behavior)
   *
   * Examples:
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
   * Returns a copy of all items in the queue
   */
  getAllItems(): Array<TValue> {
    return [...this.items]
  }
}
