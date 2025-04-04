import { describe, expect, it, vi } from 'vitest'
import { Queuer } from '../src/queuer'

describe('Queuer', () => {
  it('should create an empty queuer', () => {
    const queuer = new Queuer()
    expect(queuer.isEmpty()).toBe(true)
    expect(queuer.size()).toBe(0)
  })

  it('should respect maxSize option', () => {
    const queuer = new Queuer({ maxSize: 2 })
    expect(queuer.addItem(1)).toBe(true)
    expect(queuer.addItem(2)).toBe(true)
    expect(queuer.addItem(3)).toBe(false)
    expect(queuer.size()).toBe(2)
  })

  describe('addItem', () => {
    it('should add items to the queuer', () => {
      const queuer = new Queuer<number>()
      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.size()).toBe(1)
      expect(queuer.peek()).toBe(1)
    })
  })

  describe('getNextItem', () => {
    it('should remove and return items in FIFO order', () => {
      const queuer = new Queuer<number>()
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(3)

      expect(queuer.getNextItem()).toBe(1)
      expect(queuer.getNextItem()).toBe(2)
      expect(queuer.getNextItem()).toBe(3)
      expect(queuer.getNextItem()).toBeUndefined()
    })

    it('should return undefined when queuer is empty', () => {
      const queuer = new Queuer<number>()
      expect(queuer.getNextItem()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return first item without removing it', () => {
      const queuer = new Queuer<number>()
      queuer.addItem(1)
      queuer.addItem(2)

      expect(queuer.peek()).toBe(1)
      expect(queuer.size()).toBe(2)
    })

    it('should return undefined when queuer is empty', () => {
      const queuer = new Queuer<number>()
      expect(queuer.peek()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when queuer is empty', () => {
      const queuer = new Queuer<number>()
      expect(queuer.isEmpty()).toBe(true)
    })

    it('should return false when queuer has items', () => {
      const queuer = new Queuer<number>()
      queuer.addItem(1)
      expect(queuer.isEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queuer reaches maxSize', () => {
      const queuer = new Queuer<number>({ maxSize: 2 })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(queuer.isFull()).toBe(true)
    })

    it('should return false when queuer is not full', () => {
      const queuer = new Queuer<number>({ maxSize: 2 })
      queuer.addItem(1)
      expect(queuer.isFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queuer', () => {
      const queuer = new Queuer<number>()
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.clear()

      expect(queuer.isEmpty()).toBe(true)
      expect(queuer.size()).toBe(0)
      expect(queuer.peek()).toBeUndefined()
    })
  })

  describe('options', () => {
    describe('initialItems', () => {
      it('should initialize queuer with provided items', () => {
        const queuer = new Queuer<number>({ initialItems: [1, 2, 3] })
        expect(queuer.size()).toBe(3)
        expect(queuer.getAllItems()).toEqual([1, 2, 3])
      })

      it('should sort initial items by priority if getPriority is provided', () => {
        const queuer = new Queuer<{ value: string; priority: number }>({
          initialItems: [
            { value: 'low', priority: 1 },
            { value: 'high', priority: 3 },
            { value: 'medium', priority: 2 },
          ],
          getPriority: (item) => item.priority,
        })

        expect(queuer.getAllItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })

      it('should handle empty initialItems array', () => {
        const queuer = new Queuer<number>({ initialItems: [] })
        expect(queuer.isEmpty()).toBe(true)
      })
    })

    describe('getPriority', () => {
      it('should maintain priority order when addIteming items', () => {
        const queuer = new Queuer<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queuer.addItem({ value: 'medium', priority: 2 })
        queuer.addItem({ value: 'high', priority: 3 })
        queuer.addItem({ value: 'low', priority: 1 })

        expect(queuer.getAllItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })

      it('should insert items in correct position based on priority', () => {
        const queuer = new Queuer<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queuer.addItem({ value: 'lowest', priority: 0 })
        queuer.addItem({ value: 'highest', priority: 4 })
        queuer.addItem({ value: 'medium', priority: 2 }) // Should go between lowest and highest

        expect(queuer.getAllItems()).toEqual([
          { value: 'lowest', priority: 0 },
          { value: 'medium', priority: 2 },
          { value: 'highest', priority: 4 },
        ])
      })

      it('should handle items with equal priorities', () => {
        const queuer = new Queuer<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queuer.addItem({ value: 'first', priority: 1 })
        queuer.addItem({ value: 'second', priority: 1 })
        queuer.addItem({ value: 'third', priority: 1 })

        // Items with equal priority should maintain FIFO order
        expect(queuer.getAllItems()).toEqual([
          { value: 'first', priority: 1 },
          { value: 'second', priority: 1 },
          { value: 'third', priority: 1 },
        ])
      })

      it('should ignore position parameter when priority is enabled', () => {
        const queuer = new Queuer<{ value: string; priority: number }>({
          getPriority: (item) => item.priority,
        })

        queuer.addItem({ value: 'medium', priority: 2 })
        queuer.addItem({ value: 'high', priority: 3 }, 'front') // front position should be ignored
        queuer.addItem({ value: 'low', priority: 1 }, 'back') // back position should be ignored

        expect(queuer.getAllItems()).toEqual([
          { value: 'low', priority: 1 },
          { value: 'medium', priority: 2 },
          { value: 'high', priority: 3 },
        ])
      })
    })

    describe('onUpdate', () => {
      it('should call onUpdate when items are added', () => {
        const onUpdate = vi.fn()
        const queuer = new Queuer<number>({ onUpdate })

        queuer.addItem(1)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queuer)
      })

      it('should call onUpdate when items are removed', () => {
        const onUpdate = vi.fn()
        const queuer = new Queuer<number>({ onUpdate })

        queuer.addItem(1)
        onUpdate.mockClear()

        queuer.getNextItem()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queuer)
      })

      it('should call onUpdate when queuer is cleared', () => {
        const onUpdate = vi.fn()
        const queuer = new Queuer<number>({ onUpdate })

        queuer.addItem(1)
        onUpdate.mockClear()

        queuer.clear()
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(queuer)
      })

      it('should not call onUpdate when dequeuing from empty queuer', () => {
        const onUpdate = vi.fn()
        const queuer = new Queuer<number>({ onUpdate })

        queuer.getNextItem()
        expect(onUpdate).not.toHaveBeenCalled()
      })
    })
  })

  it('should support stack-like (LIFO) operations', () => {
    const queuer = new Queuer<number>()
    expect(queuer.addItem(1, 'back')).toBe(true)
    expect(queuer.addItem(2, 'back')).toBe(true)
    expect(queuer.addItem(3, 'back')).toBe(true)

    // Should behave like a stack when using 'back' position
    expect(queuer.getNextItem('back')).toBe(3)
    expect(queuer.getNextItem('back')).toBe(2)
    expect(queuer.getNextItem('back')).toBe(1)
    expect(queuer.getNextItem('back')).toBeUndefined()
  })

  it('should support double-ended operations', () => {
    const queuer = new Queuer<number>()

    // Add items from both ends
    queuer.addItem(1, 'back') // [1]
    queuer.addItem(2, 'front') // [2,1]
    queuer.addItem(3, 'back') // [2,1,3]

    expect(queuer.peek('front')).toBe(2)
    expect(queuer.peek('back')).toBe(3)
    expect(queuer.size()).toBe(3)

    // Remove from both ends
    expect(queuer.getNextItem('front')).toBe(2)
    expect(queuer.getNextItem('back')).toBe(3)
    expect(queuer.getNextItem('front')).toBe(1)
  })
})
