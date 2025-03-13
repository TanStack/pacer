export interface StackOptions<TValue> {
  maxSize?: number
  initialItems?: Array<TValue>
  onUpdate?: (stacker: Stacker<TValue>) => void
}

/**
 * A basic LIFO (Last In First Out) stack implementation
 */
export class Stacker<TValue> {
  private items: Array<TValue> = []
  private options: Required<StackOptions<TValue>>

  constructor(options: StackOptions<TValue> = {}) {
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
   * Adds an item to the top of the stack
   * @returns false if stack is full, true if item was added
   */
  push(item: TValue): boolean {
    if (this.isFull()) {
      return false
    }
    this.items.push(item)
    this.options.onUpdate(this)
    return true
  }

  /**
   * Removes and returns the top item in the stack
   * @returns the top item or undefined if stack is empty
   */
  pop(): TValue | undefined {
    const item = this.items.pop()
    if (item !== undefined) {
      this.options.onUpdate(this)
    }
    return item
  }

  /**
   * Returns the top item without removing it
   */
  peek(): TValue | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * Returns true if the stack is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Returns true if the stack is full
   */
  isFull(): boolean {
    return this.items.length >= this.options.maxSize
  }

  /**
   * Returns the current size of the stack
   */
  size(): number {
    return this.items.length
  }

  /**
   * Removes all items from the stack
   */
  clear(): void {
    this.items = []
    this.options.onUpdate(this)
  }

  /**
   * Returns a copy of all items in the stack
   */
  getItems(): Array<TValue> {
    return [...this.items]
  }
}
