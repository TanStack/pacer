import { describe, expect, test } from 'vitest'
import { Stack } from '../src/stack'

describe('Stack', () => {
  test('should create an empty stack', () => {
    const stack = new Stack()
    expect(stack.isEmpty()).toBe(true)
    expect(stack.size()).toBe(0)
  })

  test('should respect maxSize option', () => {
    const stack = new Stack({ maxSize: 2 })
    expect(stack.push(1)).toBe(true)
    expect(stack.push(2)).toBe(true)
    expect(stack.push(3)).toBe(false)
    expect(stack.size()).toBe(2)
  })

  describe('push', () => {
    test('should add items to the stack', () => {
      const stack = new Stack<number>()
      expect(stack.push(1)).toBe(true)
      expect(stack.size()).toBe(1)
      expect(stack.peek()).toBe(1)
    })
  })

  describe('pop', () => {
    test('should remove and return items in LIFO order', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)
      stack.push(3)

      expect(stack.pop()).toBe(3)
      expect(stack.pop()).toBe(2)
      expect(stack.pop()).toBe(1)
      expect(stack.pop()).toBeUndefined()
    })

    test('should return undefined when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.pop()).toBeUndefined()
    })
  })

  describe('peek', () => {
    test('should return top item without removing it', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)

      expect(stack.peek()).toBe(2)
      expect(stack.size()).toBe(2)
    })

    test('should return undefined when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    test('should return true when stack is empty', () => {
      const stack = new Stack<number>()
      expect(stack.isEmpty()).toBe(true)
    })

    test('should return false when stack has items', () => {
      const stack = new Stack<number>()
      stack.push(1)
      expect(stack.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    test('should return true when stack reaches maxSize', () => {
      const stack = new Stack<number>({ maxSize: 2 })
      stack.push(1)
      stack.push(2)
      expect(stack.isFull()).toBe(true)
    })

    test('should return false when stack is not full', () => {
      const stack = new Stack<number>({ maxSize: 2 })
      stack.push(1)
      expect(stack.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    test('should remove all items from the stack', () => {
      const stack = new Stack<number>()
      stack.push(1)
      stack.push(2)
      stack.clear()

      expect(stack.isEmpty()).toBe(true)
      expect(stack.size()).toBe(0)
      expect(stack.peek()).toBeUndefined()
    })
  })
})
