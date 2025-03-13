import { describe, expect, it, vi } from 'vitest'
import { Queuer } from '../src/queuer'

describe('Queuer', () => {
  it('should create an empty queue', () => {
    const queue = new Queuer()
    expect(queue.isEmpty()).toBe(true)
    expect(queue.size()).toBe(0)
  })

  it('should respect maxSize option', () => {
    const queue = new Queuer({ maxSize: 2 })
    expect(queue.enqueue(1)).toBe(true)
    expect(queue.enqueue(2)).toBe(true)
    expect(queue.enqueue(3)).toBe(false)
    expect(queue.size()).toBe(2)
  })

  describe('enqueue', () => {
    it('should add items to the queue', () => {
      const queue = new Queuer<number>()
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('should remove and return items in FIFO order', () => {
      const queue = new Queuer<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return undefined when queue is empty', () => {
      const queue = new Queuer<number>()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return first item without removing it', () => {
      const queue = new Queuer<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
    })

    it('should return undefined when queue is empty', () => {
      const queue = new Queuer<number>()
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when queue is empty', () => {
      const queue = new Queuer<number>()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false when queue has items', () => {
      const queue = new Queuer<number>()
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queue reaches maxSize', () => {
      const queue = new Queuer<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })

    it('should return false when queue is not full', () => {
      const queue = new Queuer<number>({ maxSize: 2 })
      queue.enqueue(1)
      expect(queue.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queue', () => {
      const queue = new Queuer<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.clear()

      expect(queue.isEmpty()).toBe(true)
      expect(queue.size()).toBe(0)
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('options', () => {
    describe('initialItems', () => {
      it('should initialize queue with provided items', () => {
        const queue = new Queuer<number>({ initialItems: [1, 2, 3] })
        expect(queue.size()).toBe(3)
        expect(queue.getItems()).toEqual([1, 2, 3])
      })

      it('should handle empty initialItems array', () => {
        const queue = new Queuer<number>({ initialItems: [] })
        expect(queue.isEmpty()).toBe(true)
      })
    })

    describe('onUpdate', () => {
      it('should call onUpdate when items are added', () => {
        const onUpdate = vi.fn()
        const queue = new Queuer<number>({ onUpdate })

        queue.enqueue(1)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should call onUpdate when items are removed', () => {
        const onUpdate = vi.fn()
        const queue = new Queuer<number>({ onUpdate })

        queue.enqueue(1)
        onUpdate.mockClear()

        queue.dequeue()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should call onUpdate when queue is cleared', () => {
        const onUpdate = vi.fn()
        const queue = new Queuer<number>({ onUpdate })

        queue.enqueue(1)
        onUpdate.mockClear()

        queue.clear()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should not call onUpdate when dequeuing from empty queue', () => {
        const onUpdate = vi.fn()
        const queue = new Queuer<number>({ onUpdate })

        queue.dequeue()
        expect(onUpdate).not.toHaveBeenCalled()
      })
    })
  })
})
