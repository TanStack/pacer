export interface QueueOptions<TValue> {
  initialItems?: Array<TValue>
  maxSize?: number
  onUpdate?: (queuer: Queuer<TValue>) => void
}

/**
 * A FIFO (First In First Out) queue implementation
 */
export class Queuer<TValue> {
  private items: Array<TValue> = []
  private options: Required<QueueOptions<TValue>>

  constructor(options: QueueOptions<TValue> = {}) {
    this.options = {
      initialItems: [],
      maxSize: Infinity,
      onUpdate: () => {},
      ...options,
    }

    if (this.options.initialItems.length) {
      this.items = [...this.options.initialItems]
    }
  }

  /**
   * Adds an item to the end of the queue
   * @returns false if queue is full, true if item was added
   */
  enqueue(item: TValue): boolean {
    if (this.isFull()) {
      return false
    }
    this.items.push(item)
    this.options.onUpdate(this)
    return true
  }

  /**
   * Removes and returns the first item in the queue
   * @returns the first item or undefined if queue is empty
   */
  dequeue(): TValue | undefined {
    const item = this.items.shift()
    if (item) {
      this.options.onUpdate(this)
    }
    return item
  }

  /**
   * Returns the first item without removing it
   */
  peek(): TValue | undefined {
    return this.items[0]
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
  getItems(): Array<TValue> {
    return [...this.items]
  }
}
