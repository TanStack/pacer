export interface QueueOptions {
  maxSize?: number
}

/**
 * A basic FIFO (First In First Out) queue implementation
 */
export class Queue<TValue> {
  private items: Array<TValue> = []
  private options: Required<QueueOptions>

  constructor(options: QueueOptions = {}) {
    this.options = {
      maxSize: Infinity,
      ...options,
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
    return true
  }

  /**
   * Removes and returns the first item in the queue
   * @returns the first item or undefined if queue is empty
   */
  dequeue(): TValue | undefined {
    return this.items.shift()
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
  }
}
