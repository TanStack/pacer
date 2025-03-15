import { describe, expect, it, vi } from 'vitest'
import { Queue } from '../src/queue'

describe('Queue', () => {
  it('should create an empty queue', () => {
    const queue = new Queue()
    expect(queue.isEmpty()).toBe(true)
    expect(queue.size()).toBe(0)
  })

  it('should respect maxSize option', () => {
    const queue = new Queue({ maxSize: 2 })
    expect(queue.enqueue(1)).toBe(true)
    expect(queue.enqueue(2)).toBe(true)
    expect(queue.enqueue(3)).toBe(false)
    expect(queue.size()).toBe(2)
  })

  describe('enqueue', () => {
    it('should add items to the queue', () => {
      const queue = new Queue<number>()
      expect(queue.enqueue(1)).toBe(true)
      expect(queue.size()).toBe(1)
      expect(queue.peek()).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('should remove and return items in FIFO order', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      queue.enqueue(2)
      queue.enqueue(3)

      expect(queue.dequeue()).toBe(1)
      expect(queue.dequeue()).toBe(2)
      expect(queue.dequeue()).toBe(3)
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return undefined when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.dequeue()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return first item without removing it', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      queue.enqueue(2)

      expect(queue.peek()).toBe(1)
      expect(queue.size()).toBe(2)
    })

    it('should return undefined when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when queue is empty', () => {
      const queue = new Queue<number>()
      expect(queue.isEmpty()).toBe(true)
    })

    it('should return false when queue has items', () => {
      const queue = new Queue<number>()
      queue.enqueue(1)
      expect(queue.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queue reaches maxSize', () => {
      const queue = new Queue<number>({ maxSize: 2 })
      queue.enqueue(1)
      queue.enqueue(2)
      expect(queue.isFull()).toBe(true)
    })

    it('should return false when queue is not full', () => {
      const queue = new Queue<number>({ maxSize: 2 })
      queue.enqueue(1)
      expect(queue.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queue', () => {
      const queue = new Queue<number>()
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
        const queue = new Queue<number>({ initialItems: [1, 2, 3] })
        expect(queue.size()).toBe(3)
        expect(queue.getItems()).toEqual([1, 2, 3])
      })

      it('should sort initial items by priority if getPriority is provided', () => {
        const queue = new Queue<{ value: string; priority: number }>({
          initialItems: [
            { value: 'low', priority: 1 },
            { value: 'high', priority: 3 },
            { value: 'medium', priority: 2 },
          ],
          getPriority: (item) => item.priority,
        })

        expect(queue.getItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })

      it('should handle empty initialItems array', () => {
        const queue = new Queue<number>({ initialItems: [] })
        expect(queue.isEmpty()).toBe(true)
      })
    })

    describe('getPriority', () => {
      it('should maintain priority order when enqueueing items', () => {
        const queue = new Queue<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queue.enqueue({ value: 'medium', priority: 2 })
        queue.enqueue({ value: 'high', priority: 3 })
        queue.enqueue({ value: 'low', priority: 1 })

        expect(queue.getItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })

      it('should insert items in correct position based on priority', () => {
        const queue = new Queue<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queue.enqueue({ value: 'lowest', priority: 0 })
        queue.enqueue({ value: 'highest', priority: 4 })
        queue.enqueue({ value: 'medium', priority: 2 }) // Should go between lowest and highest

        expect(queue.getItems()).toEqual([
          { value: 'lowest', priority: 0 },
          { value: 'medium', priority: 2 },
          { value: 'highest', priority: 4 },
        ])
      })

      it('should handle items with equal priorities', () => {
        const queue = new Queue<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queue.enqueue({ value: 'first', priority: 1 })
        queue.enqueue({ value: 'second', priority: 1 })
        queue.enqueue({ value: 'third', priority: 1 })

        // Items with equal priority should maintain FIFO order
        expect(queue.getItems()).toEqual([
          { value: 'first', priority: 1 },
          { value: 'second', priority: 1 },
          { value: 'third', priority: 1 },
        ])
      })

      it('should ignore position parameter when priority is enabled', () => {
        const queue = new Queue<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queue.enqueue({ value: 'medium', priority: 2 })
        queue.enqueue({ value: 'high', priority: 3 }, 'front') // front position should be ignored
        queue.enqueue({ value: 'low', priority: 1 }, 'back') // back position should be ignored

        expect(queue.getItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })
    })

    describe('onUpdate', () => {
      it('should call onUpdate when items are added', () => {
        const onUpdate = vi.fn()
        const queue = new Queue<number>({ onUpdate })

        queue.enqueue(1)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should call onUpdate when items are removed', () => {
        const onUpdate = vi.fn()
        const queue = new Queue<number>({ onUpdate })

        queue.enqueue(1)
        onUpdate.mockClear()

        queue.dequeue()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should call onUpdate when queue is cleared', () => {
        const onUpdate = vi.fn()
        const queue = new Queue<number>({ onUpdate })

        queue.enqueue(1)
        onUpdate.mockClear()

        queue.clear()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queue)
      })

      it('should not call onUpdate when dequeuing from empty queue', () => {
        const onUpdate = vi.fn()
        const queue = new Queue<number>({ onUpdate })

        queue.dequeue()
        expect(onUpdate).not.toHaveBeenCalled()
      })
    })
  })

  it('should support stack-like (LIFO) operations', () => {
    const queue = new Queue<number>()
    expect(queue.enqueue(1, 'back')).toBe(true)
    expect(queue.enqueue(2, 'back')).toBe(true)
    expect(queue.enqueue(3, 'back')).toBe(true)

    // Should behave like a stack when using 'back' position
    expect(queue.dequeue('back')).toBe(3)
    expect(queue.dequeue('back')).toBe(2)
    expect(queue.dequeue('back')).toBe(1)
    expect(queue.dequeue('back')).toBeUndefined()
  })

  it('should support double-ended operations', () => {
    const queue = new Queue<number>()

    // Add items from both ends
    queue.enqueue(1, 'back') // [1]
    queue.enqueue(2, 'front') // [2,1]
    queue.enqueue(3, 'back') // [2,1,3]

    expect(queue.peek('front')).toBe(2)
    expect(queue.peek('back')).toBe(3)
    expect(queue.size()).toBe(3)

    // Remove from both ends
    expect(queue.dequeue('front')).toBe(2)
    expect(queue.dequeue('back')).toBe(3)
    expect(queue.dequeue('front')).toBe(1)
  })
})
