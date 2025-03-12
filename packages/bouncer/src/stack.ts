export interface StackOptions {
  maxSize?: number
}

/**
 * A basic LIFO (Last In First Out) stack implementation
 */
export class Stack<TValue> {
  private items: Array<TValue> = []
  private options: Required<StackOptions>

  constructor(options: StackOptions = {}) {
    this.options = {
      maxSize: Infinity,
      ...options,
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
    return true
  }

  /**
   * Removes and returns the top item in the stack
   * @returns the top item or undefined if stack is empty
   */
  pop(): TValue | undefined {
    return this.items.pop()
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
  }
}
