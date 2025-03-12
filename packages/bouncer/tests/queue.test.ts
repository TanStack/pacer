import { describe, expect, test } from 'vitest'
import { Queue } from '../src/queue'

describe('Queue', () => {
  test('should create an empty queue', () => {
    const queue = new Queue()
    expect(queue.isEmpty()).toBe(true)
    expect(queue.size()).toBe(0)
  })

  test('should respect maxSize option', () => {
    const queue = new Queue({ maxSize: 2 })
    expect(queue.enqueue(1)).toBe(true)
    expect(queue.enqueue(2)).toBe(true)
    expect(queue.enqueue(3)).toBe(false)
    expect(queue.size()).toBe(2)
  })

  describe('enqueue', () => {
    test('should add items to the queue', () => {
      const queue = new Queue<number>()
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(1)
    })
  })

  describe('dequeue', () => {
    test('should remove and return items in FIFO order', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBeUndefined()
    })

    test('should return undefined when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    test('should return first item without removing it', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
    })

    test('should return undefined when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    test('should return true when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.isEmpty()).toBe(true)
    })

    test('should return false when queue has items', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    test('should return true when queue reaches maxSize', () => {
      const queue = new Queue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })

    test('should return false when queue is not full', () => {
      const queue = new Queue<number>({ maxSize: 2 })
      queue.enqueue(1)
      expect(queue.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    test('should remove all items from the queue', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()

      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
      expect(queue.peek()).toBeUndefined()
    })
  })
})
