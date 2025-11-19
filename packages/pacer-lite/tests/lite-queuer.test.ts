import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiteQueuer, liteQueue } from '../src/lite-queuer'

describe('LiteQueuer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create an empty queuer', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      expect(queuer.size).toBe(0)
      expect(queuer.isEmpty).toBe(true)
      expect(queuer.isQueueRunning).toBe(false)
    })

    it('should start with started: true by default', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {})

      expect(queuer.isQueueRunning).toBe(true)
    })

    it('should respect maxSize option', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { maxSize: 2, started: false })

      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.addItem(2)).toBe(true)
      expect(queuer.addItem(3)).toBe(false)
      expect(queuer.size).toBe(2)
    })

    it('should set default options correctly', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {})

      expect(queuer.options.addItemsTo).toBe('back')
      expect(queuer.options.getItemsFrom).toBe('front')
      expect(queuer.options.maxSize).toBe(Infinity)
      expect(queuer.options.started).toBe(true)
      expect(queuer.options.wait).toBe(0)
    })
  })

  describe('addItem', () => {
    it('should add items to the queue', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.size).toBe(1)
      expect(queuer.peekNextItem()).toBe(1)
      expect(queuer.isEmpty).toBe(false)
    })

    it('should add items to back by default', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(3)

      expect(queuer.peekAllItems()).toEqual([1, 2, 3])
    })

    it('should add items to front when specified', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem(1, 'front')
      queuer.addItem(2, 'front')
      queuer.addItem(3, 'front')

      expect(queuer.peekAllItems()).toEqual([3, 2, 1])
    })

    it('should reject items when queue is full', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { maxSize: 1, started: false })

      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.addItem(2)).toBe(false)
      expect(queuer.size).toBe(1)
    })
  })

  describe('getNextItem', () => {
    it('should remove and return items in FIFO order', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(3)

      expect(queuer.getNextItem()).toBe(1)
      expect(queuer.getNextItem()).toBe(2)
      expect(queuer.getNextItem()).toBe(3)
      expect(queuer.getNextItem()).toBeUndefined()
    })

    it('should return undefined when queue is empty', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      expect(queuer.getNextItem()).toBeUndefined()
    })

    it('should support LIFO when getting from back', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(3)

      expect(queuer.getNextItem('back')).toBe(3)
      expect(queuer.getNextItem('back')).toBe(2)
      expect(queuer.getNextItem('back')).toBe(1)
    })
  })

  describe('execute', () => {
    it('should execute function with next item', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem('test')
      const result = queuer.execute()

      expect(result).toBe('test')
      expect(mockFn).toHaveBeenCalledWith('test')
      expect(queuer.size).toBe(0)
    })

    it('should return undefined when queue is empty', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      const result = queuer.execute()

      expect(result).toBeUndefined()
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('Priority System', () => {
    it('should maintain priority order when adding items', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        getPriority: (item: any) => item.priority,
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
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        getPriority: (item: any) => item.priority,
        started: false,
      })

      queuer.addItem({ value: 'lowest', priority: 0 })
      queuer.addItem({ value: 'highest', priority: 4 })
      queuer.addItem({ value: 'medium', priority: 2 })

      expect(queuer.peekAllItems()).toEqual([
        { value: 'highest', priority: 4 },
        { value: 'medium', priority: 2 },
        { value: 'lowest', priority: 0 },
      ])
    })

    it('should handle items with equal priorities', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        getPriority: (item: any) => item.priority,
        started: false,
      })

      queuer.addItem({ value: 'first', priority: 1 })
      queuer.addItem({ value: 'second', priority: 1 })
      queuer.addItem({ value: 'third', priority: 1 })

      // Equal priority items should maintain their insertion order
      expect(queuer.peekAllItems()).toEqual([
        { value: 'first', priority: 1 },
        { value: 'second', priority: 1 },
        { value: 'third', priority: 1 },
      ])
    })

    it('should handle items without priority when getPriority returns undefined', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        getPriority: (item: any) => item.priority,
        started: false,
      })

      queuer.addItem({ value: 'no-priority' }) // priority undefined, added to back
      queuer.addItem({ value: 'with-priority', priority: 5 })

      // With-priority item should be inserted at correct priority position
      expect(queuer.peekAllItems()).toEqual([
        { value: 'with-priority', priority: 5 },
        { value: 'no-priority' },
      ])
    })

    it('should always get from front when priority function is provided', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        getPriority: (item: any) => item.priority,
        started: false,
      })

      queuer.addItem({ value: 'low', priority: 1 })
      queuer.addItem({ value: 'high', priority: 3 })

      // Even when requesting from back, should get highest priority (front)
      expect(queuer.getNextItem('back')).toEqual({ value: 'high', priority: 3 })
      expect(queuer.getNextItem('back')).toEqual({ value: 'low', priority: 1 })
    })
  })

  describe('Initial Items', () => {
    it('should initialize queue with provided items', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        initialItems: [1, 2, 3],
        started: false,
      })

      expect(queuer.size).toBe(3)
      expect(queuer.peekAllItems()).toEqual([1, 2, 3])
    })

    it('should sort initial items by priority if getPriority is provided', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        initialItems: [
          { value: 'low', priority: 1 },
          { value: 'high', priority: 3 },
          { value: 'medium', priority: 2 },
        ],
        getPriority: (item: any) => item.priority,
        started: false,
      })

      expect(queuer.peekAllItems()).toEqual([
        { value: 'high', priority: 3 },
        { value: 'medium', priority: 2 },
        { value: 'low', priority: 1 },
      ])
    })

    it('should handle empty initialItems array', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        initialItems: [],
        started: false,
      })

      expect(queuer.isEmpty).toBe(true)
    })
  })

  describe('Auto Processing', () => {
    it('should auto-process items when started', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: true })

      queuer.addItem('test1')
      queuer.addItem('test2')

      vi.runAllTimers()

      expect(mockFn).toHaveBeenCalledWith('test1')
      expect(mockFn).toHaveBeenCalledWith('test2')
      expect(queuer.isEmpty).toBe(true)
    })

    it('should respect wait time between executions', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        started: true,
        wait: 100,
      })

      queuer.addItem('test1')
      queuer.addItem('test2')

      expect(mockFn).toHaveBeenCalledWith('test1')
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test2')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not auto-process when started: false', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem('test')

      vi.runAllTimers()

      expect(mockFn).not.toHaveBeenCalled()
      expect(queuer.size).toBe(1)
    })
  })

  describe('Start/Stop Control', () => {
    it('should start processing when start() is called', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      queuer.addItem('test')
      expect(mockFn).not.toHaveBeenCalled()

      queuer.start()
      vi.runAllTimers()

      expect(mockFn).toHaveBeenCalledWith('test')
      expect(queuer.isQueueRunning).toBe(true)
    })

    it('should stop processing when stop() is called', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        started: true,
        wait: 100,
      })

      queuer.addItem('test1')
      queuer.addItem('test2')

      expect(mockFn).toHaveBeenCalledWith('test1')

      queuer.stop()
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(queuer.isQueueRunning).toBe(false)
      expect(queuer.size).toBe(1) // test2 still in queue
    })

    it('should clear pending timeout when stopped', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        started: true,
        wait: 1000,
      })

      queuer.addItem('test1')
      queuer.addItem('test2')

      expect(mockFn).toHaveBeenCalledWith('test1')

      queuer.stop()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Utility Methods', () => {
    describe('peekNextItem', () => {
      it('should return next item without removing it', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)

        expect(queuer.peekNextItem()).toBe(1)
        expect(queuer.size).toBe(2)
        expect(queuer.peekNextItem()).toBe(1) // Still there
      })

      it('should return undefined when queue is empty', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        expect(queuer.peekNextItem()).toBeUndefined()
      })

      it('should peek from back when specified', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        expect(queuer.peekNextItem('back')).toBe(3)
        expect(queuer.size).toBe(3)
      })

      it('should always peek from front when priority function exists', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, {
          getPriority: (item: any) => item.priority,
          started: false,
        })

        queuer.addItem({ value: 'low', priority: 1 })
        queuer.addItem({ value: 'high', priority: 3 })

        expect(queuer.peekNextItem('back')).toEqual({
          value: 'high',
          priority: 3,
        })
      })
    })

    describe('peekAllItems', () => {
      it('should return copy of all items', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        const items = queuer.peekAllItems()
        expect(items).toEqual([1, 2, 3])

        // Should be a copy, not reference
        items.push(4)
        expect(queuer.peekAllItems()).toEqual([1, 2, 3])
      })

      it('should return empty array when queue is empty', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        expect(queuer.peekAllItems()).toEqual([])
      })
    })

    describe('clear', () => {
      it('should remove all items from queue', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.clear()

        expect(queuer.isEmpty).toBe(true)
        expect(queuer.size).toBe(0)
        expect(queuer.peekNextItem()).toBeUndefined()
      })
    })

    describe('flush', () => {
      it('should process all items immediately', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, {
          started: false,
          wait: 1000,
        })

        queuer.addItem('test1')
        queuer.addItem('test2')
        queuer.addItem('test3')

        queuer.flush()

        expect(mockFn).toHaveBeenCalledWith('test1')
        expect(mockFn).toHaveBeenCalledWith('test2')
        expect(mockFn).toHaveBeenCalledWith('test3')
        expect(queuer.isEmpty).toBe(true)
      })

      it('should process specified number of items', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem('test1')
        queuer.addItem('test2')
        queuer.addItem('test3')

        queuer.flush(2)

        expect(mockFn).toHaveBeenCalledTimes(2)
        expect(queuer.size).toBe(1)
        expect(queuer.peekNextItem()).toBe('test3')
      })

      it('should restart processing if queue is running and has remaining items', () => {
        const mockFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, {
          started: false,
          wait: 100,
        })

        queuer.addItem('test1')
        queuer.addItem('test2')
        queuer.addItem('test3')

        // Manually flush 2 items
        queuer.flush(2)

        expect(mockFn).toHaveBeenCalledWith('test1')
        expect(mockFn).toHaveBeenCalledWith('test2')
        expect(mockFn).toHaveBeenCalledTimes(2)
        expect(queuer.size).toBe(1)

        // Now start processing - should process remaining item
        queuer.start()

        vi.runAllTimers()

        expect(mockFn).toHaveBeenCalledWith('test3')
        expect(mockFn).toHaveBeenCalledTimes(3)
      })
    })

    describe('flushAsBatch', () => {
      it('should process all items as a batch', () => {
        const mockFn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem('test1')
        queuer.addItem('test2')
        queuer.addItem('test3')

        queuer.flushAsBatch(batchFn)

        expect(batchFn).toHaveBeenCalledWith(['test1', 'test2', 'test3'])
        expect(mockFn).not.toHaveBeenCalled() // Individual function not called
        expect(queuer.isEmpty).toBe(true)
      })

      it('should clear queue after batch processing', () => {
        const mockFn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.addItem('test')
        queuer.flushAsBatch(batchFn)

        expect(queuer.size).toBe(0)
        expect(queuer.isEmpty).toBe(true)
      })

      it('should handle empty queue', () => {
        const mockFn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new LiteQueuer(mockFn, { started: false })

        queuer.flushAsBatch(batchFn)

        expect(batchFn).toHaveBeenCalledWith([])
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid item additions', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      for (let i = 0; i < 100; i++) {
        queuer.addItem(i)
      }

      expect(queuer.size).toBe(100)
      expect(queuer.peekNextItem()).toBe(0)
    })

    it('should handle zero wait time', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        started: true,
        wait: 0,
      })

      queuer.addItem('test1')
      queuer.addItem('test2')

      vi.runAllTimers()

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle adding items while processing', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, {
        started: true,
        wait: 100,
      })

      queuer.addItem('test1')
      expect(mockFn).toHaveBeenCalledWith('test1')

      queuer.addItem('test2')
      queuer.addItem('test3')

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test2')

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test3')
    })
  })

  describe('Callbacks', () => {
    it('should not call callbacks when not provided', () => {
      const mockFn = vi.fn()
      const queuer = new LiteQueuer(mockFn, { started: false })

      // Should not throw when callbacks are undefined
      expect(() => {
        queuer.addItem('test')
        queuer.execute()
        queuer.clear()
      }).not.toThrow()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    // TODO: Add comprehensive callback tests once onExecute, onReject, and onItemsChange callbacks are implemented
    // These tests will verify:
    // - onExecute is called when items are processed
    // - onReject is called when queue is full
    // - onItemsChange is called when items are added/removed
    // - Callbacks work with priority queues, auto-processing, and manual operations
    // - Error handling in callbacks
  })
})

describe('liteQueue helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a queue function', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, { started: false })

      expect(typeof queueFn).toBe('function')

      queueFn('test')
      expect(mockFn).not.toHaveBeenCalled() // Not started
    })

    it('should add items when called', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, { started: true })

      const result1 = queueFn('test1')
      const result2 = queueFn('test2')

      expect(result1).toBe(true)
      expect(result2).toBe(true)

      vi.runAllTimers()

      expect(mockFn).toHaveBeenCalledWith('test1')
      expect(mockFn).toHaveBeenCalledWith('test2')
    })

    it('should return false when queue is full', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, {
        maxSize: 1,
        started: false,
      })

      expect(queueFn('test1')).toBe(true)
      expect(queueFn('test2')).toBe(false)
    })

    it('should work with wait times', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, {
        started: true,
        wait: 100,
      })

      queueFn('test1')
      queueFn('test2')

      expect(mockFn).toHaveBeenCalledWith('test1')
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test2')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should work with priority', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, {
        getPriority: (item: any) => item.priority,
        started: true,
        wait: 0, // No wait to simplify test
      })

      queueFn({ value: 'low', priority: 1 })
      queueFn({ value: 'high', priority: 3 })

      vi.runAllTimers()

      // First item added should process first (low priority)
      // Second item (high priority) should process after due to immediate processing
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(1, { value: 'low', priority: 1 })
      expect(mockFn).toHaveBeenNthCalledWith(2, { value: 'high', priority: 3 })
    })
  })

  describe('Callbacks', () => {
    // TODO: Add comprehensive callback tests once onExecute, onReject, and onItemsChange callbacks are implemented
    // These tests will verify:
    // - Helper functions work correctly with all callback types
    // - Callbacks are called at the right times during queue operations
    // - Integration between helper functions and callback functionality

    it('should not throw when callbacks are not provided', () => {
      const mockFn = vi.fn()
      const queueFn = liteQueue(mockFn, { started: true, wait: 0 })

      expect(() => {
        queueFn('test1')
        queueFn('test2')
        vi.runAllTimers()
      }).not.toThrow()

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })
})
