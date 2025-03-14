import { describe, expect, it, vi } from 'vitest'
import { Stack } from '../../src/data-structures/stack'

describe('Stack', () => {
  it('should create an empty stack', () => {
    const stack = new Stack()
    expect(stack.isEmpty()).toBe(true)
    expect(stack.size()).toBe(0)
  })

  it('should respect maxSize option', () => {
    const stack = new Stack({ maxSize: 2 })
    expect(stack.push(1)).toBe(true)
    expect(stack.push(2)).toBe(true)
    expect(stack.push(3)).toBe(false)
    expect(stack.size()).toBe(2)
  })

  describe('push', () => {
    it('should add items to the stack', () => {
      const stack = new Stack<number>()
      expect(stack.push(1)).toBe(true)
      expect(stack.size()).toBe(1)
      expect(stack.peek()).toBe(1)
    })
  })

  describe('pop', () => {
    it('should remove and return items in LIFO order', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)

      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
      expect(stack.pop()).toBeUndefined()
    })

    it('should return undefined when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.pop()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return top item without removing it', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)

      expect(stack.peek()).toBe(2)
      expect(stack.size()).toBe(2)
    })

    it('should return undefined when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.isEmpty()).toBe(true)
    })

    it('should return false when stack has items', () => {
      const stack = new Stack<number>()
      stack.push(1)
      expect(stack.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when stack reaches maxSize', () => {
      const stack = new Stack<number>({ maxSize: 2 })
      stack.push(1)
      stack.push(2)
      expect(stack.isFull()).toBe(true)
    })

    it('should return false when stack is not full', () => {
      const stack = new Stack<number>({ maxSize: 2 })
      stack.push(1)
      expect(stack.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the stack', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()

      expect(stack.isEmpty()).toBe(true)
      expect(stack.size()).toBe(0)
      expect(stack.peek()).toBeUndefined()
    })
  })

  describe('options', () => {
    describe('initialItems', () => {
      it('should initialize stack with provided items', () => {
        const stack = new Stack<number>({ initialItems: [1, 2, 3] })
        expect(stack.size()).toBe(3)
        expect(stack.getItems()).toEqual([1, 2, 3])
      })

      it('should handle empty initialItems array', () => {
        const stack = new Stack<number>({ initialItems: [] })
        expect(stack.isEmpty()).toBe(true)
      })
    })

    describe('onUpdate', () => {
      it('should call onUpdate when items are added', () => {
        const onUpdate = vi.fn()
        const stack = new Stack<number>({ onUpdate })

        stack.push(1)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(stack)
      })

      it('should call onUpdate when items are removed', () => {
        const onUpdate = vi.fn()
        const stack = new Stack<number>({ onUpdate })

        stack.push(1)
        onUpdate.mockClear()

        stack.pop()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(stack)
      })

      it('should call onUpdate when stack is cleared', () => {
        const onUpdate = vi.fn()
        const stack = new Stack<number>({ onUpdate })

        stack.push(1)
        onUpdate.mockClear()

        stack.clear()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(stack)
      })

      it('should not call onUpdate when popping from empty stack', () => {
        const onUpdate = vi.fn()
        const stack = new Stack<number>({ onUpdate })

        stack.pop()
        expect(onUpdate).not.toHaveBeenCalled()
      })
    })
  })
})
