import { describe, expect, it, vi } from 'vitest'
import { Queuer } from '../src/queuer'

describe('Queuer', () => {
  it('should create an empty queuer', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { started: false })
    expect(queuer.getIsEmpty()).toBe(true)
    expect(queuer.getSize()).toBe(0)
  })

  it('should start with started: true by default', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, {})
    expect(queuer.getIsRunning()).toBe(true)
  })

  it('should respect maxSize option', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { maxSize: 2, started: false })
    expect(queuer.addItem(1)).toBe(true)
    expect(queuer.addItem(2)).toBe(true)
    expect(queuer.addItem(3)).toBe(false)
    expect(queuer.getSize()).toBe(2)
  })

  describe('addItem', () => {
    it('should add items to the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.getSize()).toBe(1)
      expect(queuer.peekNextItem()).toBe(1)
    })
  })

  describe('getNextItem', () => {
    it('should remove and return items in FIFO order', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(3)

      expect(queuer.execute()).toBe(1)
      expect(queuer.execute()).toBe(2)
      expect(queuer.execute()).toBe(3)
      expect(queuer.execute()).toBeUndefined()
    })

    it('should return undefined when queuer is empty', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.execute()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return first item without removing it', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      queuer.addItem(2)

      expect(queuer.peekNextItem()).toBe(1)
      expect(queuer.getSize()).toBe(2)
    })

    it('should return undefined when queuer is empty', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.peekNextItem()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when queuer is empty', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.getIsEmpty()).toBe(true)
    })

    it('should return false when queuer has items', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      expect(queuer.getIsEmpty()).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queuer reaches maxSize', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 2, started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(queuer.getIsFull()).toBe(true)
    })

    it('should return false when queuer is not full', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 2, started: false })
      queuer.addItem(1)
      expect(queuer.getIsFull()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.clear()

      expect(queuer.getIsEmpty()).toBe(true)
      expect(queuer.getSize()).toBe(0)
      expect(queuer.peekNextItem()).toBeUndefined()
    })
  })

  describe('options', () => {
    describe('initialItems', () => {
      it('should initialize queuer with provided items', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          initialItems: [1, 2, 3],
          started: false,
        })
        expect(queuer.getSize()).toBe(3)
        expect(queuer.peekAllItems()).toEqual([1, 2, 3])
      })

      it('should sort initial items by priority if getPriority is provided', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          initialItems: [
            { value: 'low', priority: 1 },
            { value: 'high', priority: 3 },
            { value: 'medium', priority: 2 },
          ],
          getPriority: (item) => item.priority,
          started: false,
        })

        expect(queuer.peekAllItems()).toEqual([
          { value: 'high', priority: 3 },
          { value: 'medium', priority: 2 },
          { value: 'low', priority: 1 },
        ])
      })

      it('should handle empty initialItems array', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { initialItems: [], started: false })
        expect(queuer.getIsEmpty()).toBe(true)
      })
    })

    describe('getPriority', () => {
      it('should maintain priority order when addIteming items', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          getPriority: (item) => item.priority,
          started: false,
        })

        queuer.addItem({ value: 'medium', priority: 2 })
        queuer.addItem({ value: 'high', priority: 3 })
        queuer.addItem({ value: 'low', priority: 1 })

        expect(queuer.peekAllItems()).toEqual([
          { value: 'high', priority: 3 },
          { value: 'medium', priority: 2 },
          { value: 'low', priority: 1 },
        ])
      })

      it('should insert items in correct position based on priority', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          getPriority: (item) => item.priority,
          started: false,
        })

        queuer.addItem({ value: 'lowest', priority: 0 })
        queuer.addItem({ value: 'highest', priority: 4 })
        queuer.addItem({ value: 'medium', priority: 2 }) // Should go between lowest and highest

        expect(queuer.peekAllItems()).toEqual([
          { value: 'highest', priority: 4 },
          { value: 'medium', priority: 2 },
          { value: 'lowest', priority: 0 },
        ])
      })

      it('should handle items with equal priorities', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          getPriority: (item) => item.priority,
          started: false,
        })

        queuer.addItem({ value: 'first', priority: 1 })
        queuer.addItem({ value: 'second', priority: 1 })
        queuer.addItem({ value: 'third', priority: 1 })

        // Items with equal priority should maintain FIFO order
        expect(queuer.peekAllItems()).toEqual([
          { value: 'first', priority: 1 },
          { value: 'second', priority: 1 },
          { value: 'third', priority: 1 },
        ])
      })

      it('should ignore position parameter when priority is enabled', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, {
          getPriority: (item) => item.priority,
          started: false,
        })

        queuer.addItem({ value: 'medium', priority: 2 })
        queuer.addItem({ value: 'high', priority: 3 }, 'front') // front position should be ignored
        queuer.addItem({ value: 'low', priority: 1 }, 'back') // back position should be ignored

        expect(queuer.peekAllItems()).toEqual([
          { value: 'high', priority: 3 },
          { value: 'medium', priority: 2 },
          { value: 'low', priority: 1 },
        ])
      })
    })

    describe('onItemsChange', () => {
      it('should call onItemsChange when items are added', () => {
        const onItemsChange = vi.fn()
        const fn = vi.fn()
        const queuer = new Queuer(fn, { onItemsChange, started: false })

        queuer.addItem(1)
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(queuer)
      })

      it('should call onItemsChange when items are removed', () => {
        const onItemsChange = vi.fn()
        const fn = vi.fn()
        const queuer = new Queuer(fn, { onItemsChange, started: false })

        queuer.addItem(1)
        onItemsChange.mockClear()

        queuer.execute()
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(queuer)
      })

      it('should call onItemsChange when queuer is cleared', () => {
        const onItemsChange = vi.fn()
        const fn = vi.fn()
        const queuer = new Queuer(fn, { onItemsChange, started: false })

        queuer.addItem(1)
        onItemsChange.mockClear()

        queuer.clear()
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(queuer)
      })

      it('should not call onItemsChange when dequeuing from empty queuer', () => {
        const onItemsChange = vi.fn()
        const fn = vi.fn()
        const queuer = new Queuer(fn, { onItemsChange, started: false })

        queuer.execute()
        expect(onItemsChange).not.toHaveBeenCalled()
      })
    })
  })

  it('should support stack-like (LIFO) operations', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { started: false })
    expect(queuer.addItem(1, 'back')).toBe(true)
    expect(queuer.addItem(2, 'back')).toBe(true)
    expect(queuer.addItem(3, 'back')).toBe(true)

    // Should behave like a stack when using 'back' position
    expect(queuer.execute('back')).toBe(3)
    expect(queuer.execute('back')).toBe(2)
    expect(queuer.execute('back')).toBe(1)
    expect(queuer.execute('back')).toBeUndefined()
  })

  it('should support double-ended operations', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { started: false })

    // Add items from both ends
    queuer.addItem(1, 'back') // [1]
    queuer.addItem(2, 'front') // [2,1]
    queuer.addItem(3, 'back') // [2,1,3]

    expect(queuer.peekNextItem('front')).toBe(2)
    expect(queuer.peekNextItem('back')).toBe(3)
    expect(queuer.getSize()).toBe(3)

    // Remove from both ends
    expect(queuer.execute('front')).toBe(2)
    expect(queuer.execute('back')).toBe(3)
    expect(queuer.execute('front')).toBe(1)
  })

  describe('setOptions', () => {
    it('should update queuer options', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { wait: 100 })
      queuer.setOptions({ wait: 200 })
      expect(queuer.getWait()).toBe(200)
    })
  })

  describe('getOptions', () => {
    it('should return current queuer options', () => {
      const fn = vi.fn()
      const options = { wait: 123, maxSize: 5 }
      const queuer = new Queuer(fn, options)
      const result = queuer.getOptions()
      expect(result.wait).toBe(123)
      expect(result.maxSize).toBe(5)
    })
  })

  describe('getWait', () => {
    it('should return the current wait time', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { wait: 42 })
      expect(queuer.getWait()).toBe(42)
    })
  })

  describe('reset', () => {
    it('should reset the queuer to its initial state', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { initialItems: [1, 2], started: false })
      queuer.addItem(3)
      queuer.reset(true)
      expect(queuer.peekAllItems()).toEqual([1, 2])
      queuer.reset()
      expect(queuer.peekAllItems()).toEqual([])
    })
  })

  describe('start', () => {
    it('should start the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.getIsRunning()).toBe(false)
      queuer.start()
      expect(queuer.getIsRunning()).toBe(true)
    })
  })

  describe('stop', () => {
    it('should stop the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: true })
      expect(queuer.getIsRunning()).toBe(true)
      queuer.stop()
      expect(queuer.getIsRunning()).toBe(false)
    })
  })

  describe('getExecutionCount', () => {
    it('should return the number of executed items', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.execute()
      queuer.execute()
      expect(queuer.getExecutionCount()).toBe(2)
    })
  })

  describe('getRejectionCount', () => {
    it('should return the number of rejected items', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 1, started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(queuer.getRejectionCount()).toBe(1)
    })
  })

  describe('callbacks', () => {
    it('should call onReject when an item is rejected', () => {
      const onReject = vi.fn()
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 1, onReject, started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(onReject).toHaveBeenCalledWith(2, queuer)
    })
    it('should call onExecute when an item is executed', () => {
      const onExecute = vi.fn()
      const fn = vi.fn()
      const queuer = new Queuer(fn, { onExecute, started: false })
      queuer.addItem(1)
      queuer.execute()
      expect(onExecute).toHaveBeenCalledWith(1, queuer)
    })
    it('should call onIsRunningChange when running state changes', () => {
      const onIsRunningChange = vi.fn()
      const fn = vi.fn()
      const queuer = new Queuer(fn, { onIsRunningChange, started: false })
      queuer.start()
      queuer.stop()
      expect(onIsRunningChange).toHaveBeenCalledTimes(2)
      expect(onIsRunningChange).toHaveBeenCalledWith(queuer)
    })
  })
})
