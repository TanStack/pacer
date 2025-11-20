import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiteBatcher, liteBatch } from '../src/lite-batcher'

describe('LiteBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create an empty batcher', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { started: false })

      expect(batcher.size).toBe(0)
      expect(batcher.isEmpty).toBe(true)
      expect(batcher.isPending).toBe(false)
    })

    it('should start with started: true by default', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, {})

      expect(batcher.options.started).toBe(true)
    })

    it('should set default options correctly', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, {})

      expect(batcher.options.maxSize).toBe(Infinity)
      expect(batcher.options.started).toBe(true)
      expect(batcher.options.wait).toBe(Infinity)
      expect(typeof batcher.options.getShouldExecute).toBe('function')
      expect(batcher.options.getShouldExecute!([], batcher)).toBe(false)
    })
  })

  describe('addItem', () => {
    it('should add items to the batch', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { started: false })

      batcher.addItem(1)
      expect(batcher.size).toBe(1)
      expect(batcher.peekAllItems()).toEqual([1])
      expect(batcher.isEmpty).toBe(false)
    })

    it('should add multiple items to the batch', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { started: false })

      batcher.addItem(1)
      batcher.addItem(2)
      batcher.addItem(3)

      expect(batcher.size).toBe(3)
      expect(batcher.peekAllItems()).toEqual([1, 2, 3])
    })

    it('should set isPending when wait is configured', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { wait: 100, started: false })

      expect(batcher.isPending).toBe(false)

      batcher.addItem(1)
      expect(batcher.isPending).toBe(true)
    })

    it('should not set isPending when wait is Infinity', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        wait: Infinity,
        started: false,
      })

      batcher.addItem(1)
      expect(batcher.isPending).toBe(false)
    })
  })

  describe('Size-based Batching', () => {
    it('should process batch when maxSize is reached', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 3, started: false })

      batcher.addItem(1)
      batcher.addItem(2)
      expect(mockFn).not.toHaveBeenCalled()

      batcher.addItem(3)
      expect(mockFn).toHaveBeenCalledWith([1, 2, 3])
      expect(batcher.isEmpty).toBe(true)
    })

    it('should clear items after processing', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 2, started: false })

      batcher.addItem('a')
      batcher.addItem('b')

      expect(mockFn).toHaveBeenCalledWith(['a', 'b'])
      expect(batcher.size).toBe(0)
      expect(batcher.isEmpty).toBe(true)
    })
  })

  describe('Time-based Batching', () => {
    it('should process batch after wait timeout', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { wait: 100, started: false })

      batcher.addItem('test1')
      batcher.addItem('test2')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
      expect(batcher.isEmpty).toBe(true)
    })

    it('should reset timeout when new items are added', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { wait: 100, started: false })

      batcher.addItem('test1')
      vi.advanceTimersByTime(50)

      batcher.addItem('test2')
      vi.advanceTimersByTime(50) // Should not trigger yet

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50) // Now it should trigger

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should support function-based wait', () => {
      const mockFn = vi.fn()
      const getWait = vi.fn(() => 200)
      const batcher = new LiteBatcher(mockFn, {
        wait: getWait,
        started: false,
      })

      batcher.addItem('test')
      expect(getWait).toHaveBeenCalledWith(batcher)

      vi.advanceTimersByTime(200)
      expect(mockFn).toHaveBeenCalledWith(['test'])
    })
  })

  describe('Custom Condition Batching', () => {
    it('should process immediately when getShouldExecute returns true', () => {
      const mockFn = vi.fn()
      const getShouldExecute = vi.fn((items: any[]) => items.length >= 2)
      const batcher = new LiteBatcher(mockFn, {
        getShouldExecute,
        started: false,
      })

      batcher.addItem('test1')
      expect(mockFn).not.toHaveBeenCalled()

      batcher.addItem('test2')
      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should pass items and batcher to getShouldExecute', () => {
      const mockFn = vi.fn()
      const getShouldExecute = vi.fn(() => true)
      const batcher = new LiteBatcher(mockFn, {
        getShouldExecute,
        started: false,
      })

      batcher.addItem('test')

      expect(getShouldExecute).toHaveBeenCalledWith(['test'], batcher)
    })

    it('should combine with other triggers', () => {
      const mockFn = vi.fn()
      const getShouldExecute = vi.fn((items: any[]) =>
        items.some((item) => item.urgent),
      )
      const batcher = new LiteBatcher(mockFn, {
        maxSize: 5,
        getShouldExecute,
        started: false,
      })

      batcher.addItem({ name: 'normal', urgent: false })
      batcher.addItem({ name: 'normal2', urgent: false })
      expect(mockFn).not.toHaveBeenCalled()

      batcher.addItem({ name: 'urgent', urgent: true })
      expect(mockFn).toHaveBeenCalledWith([
        { name: 'normal', urgent: false },
        { name: 'normal2', urgent: false },
        { name: 'urgent', urgent: true },
      ])
    })
  })

  describe('Manual Processing', () => {
    describe('flush', () => {
      it('should process all items immediately', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, {
          wait: 1000,
          started: false,
        })

        batcher.addItem('test1')
        batcher.addItem('test2')
        batcher.addItem('test3')

        expect(mockFn).not.toHaveBeenCalled()

        batcher.flush()

        expect(mockFn).toHaveBeenCalledWith(['test1', 'test2', 'test3'])
        expect(batcher.isEmpty).toBe(true)
      })

      it('should clear pending timeout when flushing', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { wait: 1000, started: false })

        batcher.addItem('test')
        expect(batcher.isPending).toBe(true)

        batcher.flush()

        expect(mockFn).toHaveBeenCalledWith(['test'])
        expect(batcher.isPending).toBe(false)

        // Timeout should not trigger anymore
        vi.advanceTimersByTime(1000)
        expect(mockFn).toHaveBeenCalledTimes(1)
      })

      it('should do nothing when batch is empty', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { started: false })

        batcher.flush()
        expect(mockFn).not.toHaveBeenCalled()
      })
    })

    describe('clear', () => {
      it('should remove all items from the batch', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { started: false })

        batcher.addItem('test1')
        batcher.addItem('test2')

        expect(batcher.size).toBe(2)

        batcher.clear()

        expect(batcher.isEmpty).toBe(true)
        expect(batcher.size).toBe(0)
        expect(batcher.peekAllItems()).toEqual([])
      })

      it('should reset isPending state', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { wait: 100, started: false })

        batcher.addItem('test')
        expect(batcher.isPending).toBe(true)

        batcher.clear()
        expect(batcher.isPending).toBe(false)
      })
    })

    describe('cancel', () => {
      it('should cancel pending execution without clearing items', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { wait: 100, started: false })

        batcher.addItem('test1')
        batcher.addItem('test2')

        expect(batcher.isPending).toBe(true)
        expect(batcher.size).toBe(2)

        batcher.cancel()

        expect(batcher.isPending).toBe(false)
        expect(batcher.size).toBe(2) // Items still there
        expect(batcher.peekAllItems()).toEqual(['test1', 'test2'])

        vi.advanceTimersByTime(100)
        expect(mockFn).not.toHaveBeenCalled()
      })
    })
  })

  describe('Utility Methods', () => {
    describe('peekAllItems', () => {
      it('should return copy of all items', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { started: false })

        batcher.addItem('test1')
        batcher.addItem('test2')

        const items = batcher.peekAllItems()
        expect(items).toEqual(['test1', 'test2'])

        // Should be a copy, not reference
        items.push('test3')
        expect(batcher.peekAllItems()).toEqual(['test1', 'test2'])
      })

      it('should return empty array when batch is empty', () => {
        const mockFn = vi.fn()
        const batcher = new LiteBatcher(mockFn, { started: false })

        expect(batcher.peekAllItems()).toEqual([])
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid item additions', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 100, started: false })

      for (let i = 0; i < 50; i++) {
        batcher.addItem(i)
      }

      expect(batcher.size).toBe(50)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle zero wait time', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { wait: 0, started: false })

      batcher.addItem('test1')
      batcher.addItem('test2')

      vi.runAllTimers()

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should handle adding items after batch is processed', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 2, started: false })

      batcher.addItem('test1')
      batcher.addItem('test2')

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
      mockFn.mockClear()

      batcher.addItem('test3')
      batcher.addItem('test4')

      expect(mockFn).toHaveBeenCalledWith(['test3', 'test4'])
    })

    it('should handle maxSize of 1', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 1, started: false })

      batcher.addItem('test1')
      expect(mockFn).toHaveBeenCalledWith(['test1'])

      batcher.addItem('test2')
      expect(mockFn).toHaveBeenCalledWith(['test2'])

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle simultaneous triggers', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        maxSize: 2,
        wait: 100,
        getShouldExecute: (items) => items.length >= 2,
        started: false,
      })

      batcher.addItem('test1')
      batcher.addItem('test2') // Should trigger immediately

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
      expect(batcher.isEmpty).toBe(true)

      // Timeout should not trigger anything
      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Options Mutability', () => {
    it('should allow modifying options after creation', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { maxSize: 5, started: false })

      expect(batcher.options.maxSize).toBe(5)

      batcher.options.maxSize = 2

      batcher.addItem('test1')
      batcher.addItem('test2')

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should allow modifying getShouldExecute after creation', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { started: false })

      batcher.addItem('test1')
      batcher.addItem('test2')
      expect(mockFn).not.toHaveBeenCalled()

      batcher.options.getShouldExecute = (items) => items.length >= 2
      batcher.addItem('test3')

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2', 'test3'])
    })
  })

  describe('Callbacks', () => {
    it('should call onExecute when batch is processed', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        maxSize: 2,
        started: false,
        onExecute,
      })

      batcher.addItem('item1')
      batcher.addItem('item2') // Should trigger execution

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['item1', 'item2'], batcher)
      expect(mockFn).toHaveBeenCalledWith(['item1', 'item2'])
    })

    it('should call onExecute with time-based batching', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        wait: 100,
        started: false,
        onExecute,
      })

      batcher.addItem('item1')
      batcher.addItem('item2')

      expect(onExecute).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['item1', 'item2'], batcher)
    })

    it('should call onExecute during manual flush', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        wait: 1000,
        started: false,
        onExecute,
      })

      batcher.addItem('item1')
      batcher.addItem('item2')
      batcher.flush()

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['item1', 'item2'], batcher)
    })

    it('should call onItemsChange when items are added', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        started: false,
        onItemsChange,
      })

      batcher.addItem('item1')
      expect(onItemsChange).toHaveBeenCalledTimes(1)
      expect(onItemsChange).toHaveBeenCalledWith(batcher)

      batcher.addItem('item2')
      expect(onItemsChange).toHaveBeenCalledTimes(2)
    })

    it('should call onItemsChange when batch is cleared', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        started: false,
        onItemsChange,
      })

      batcher.addItem('item1')
      batcher.addItem('item2')
      onItemsChange.mockClear()

      batcher.clear()
      expect(onItemsChange).toHaveBeenCalledTimes(1)
      expect(onItemsChange).toHaveBeenCalledWith(batcher)
    })

    it('should not call onItemsChange when clearing empty batch', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        started: false,
        onItemsChange,
      })

      batcher.clear() // Clear empty batch
      expect(onItemsChange).not.toHaveBeenCalled()
    })

    it('should call onItemsChange when batch is processed', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        maxSize: 2,
        started: false,
        onItemsChange,
      })

      batcher.addItem('item1')
      batcher.addItem('item2') // Should trigger execution

      // Called once for each add, and once for clearing during execution
      expect(onItemsChange).toHaveBeenCalledTimes(3)
    })

    it('should not call callbacks when not provided', () => {
      const mockFn = vi.fn()
      const batcher = new LiteBatcher(mockFn, { started: false })

      // Should not throw when callbacks are undefined
      expect(() => {
        batcher.addItem('test1')
        batcher.addItem('test2')
        batcher.flush()
        batcher.clear()
      }).not.toThrow()

      expect(mockFn).toHaveBeenCalledTimes(1) // Once from flush
    })

    it('should call callbacks with custom execution condition', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        getShouldExecute: (items) => items.some((item: any) => item.urgent),
        started: false,
        onExecute,
        onItemsChange,
      })

      batcher.addItem({ name: 'normal', urgent: false })
      batcher.addItem({ name: 'urgent', urgent: true }) // Should trigger

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onItemsChange).toHaveBeenCalledTimes(3) // 2 adds + 1 clear from execution
    })

    it('should handle errors in onExecute callback gracefully', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn(() => {
        throw new Error('Callback error')
      })
      const batcher = new LiteBatcher(mockFn, {
        maxSize: 1,
        started: false,
        onExecute,
      })

      // Callback errors should propagate (not handled gracefully in current implementation)
      expect(() => batcher.addItem('test')).toThrow('Callback error')
      expect(mockFn).toHaveBeenCalledWith(['test'])
      expect(onExecute).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in onItemsChange callback gracefully', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn(() => {
        throw new Error('Callback error')
      })
      const batcher = new LiteBatcher(mockFn, {
        started: false,
        onItemsChange,
      })

      // Callback errors should propagate (not handled gracefully in current implementation)
      expect(() => batcher.addItem('test')).toThrow('Callback error')
      expect(onItemsChange).toHaveBeenCalledTimes(1)
    })

    it('should call callbacks with function-based wait', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const getWait = vi.fn(() => 200)
      const batcher = new LiteBatcher(mockFn, {
        wait: getWait,
        started: false,
        onExecute,
      })

      batcher.addItem('test')
      expect(getWait).toHaveBeenCalledWith(batcher)

      vi.advanceTimersByTime(200)
      expect(onExecute).toHaveBeenCalledWith(['test'], batcher)
    })

    it('should call onExecute after canceling and flushing', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batcher = new LiteBatcher(mockFn, {
        wait: 100,
        started: false,
        onExecute,
      })

      batcher.addItem('test1')
      batcher.addItem('test2')
      batcher.cancel() // Cancel timeout

      expect(onExecute).not.toHaveBeenCalled()

      batcher.flush() // Manual flush
      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onExecute).toHaveBeenCalledWith(['test1', 'test2'], batcher)
    })
  })
})

describe('liteBatch helper function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should create a batch function', () => {
      const mockFn = vi.fn()
      const batchFn = liteBatch(mockFn, { started: false })

      expect(typeof batchFn).toBe('function')

      batchFn('test')
      expect(mockFn).not.toHaveBeenCalled() // Not started
    })

    it('should add items when called', () => {
      const mockFn = vi.fn()
      const batchFn = liteBatch(mockFn, { maxSize: 2, started: false })

      batchFn('test1')
      batchFn('test2')

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should work with wait times', () => {
      const mockFn = vi.fn()
      const batchFn = liteBatch(mockFn, { wait: 100, started: false })

      batchFn('test1')
      batchFn('test2')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith(['test1', 'test2'])
    })

    it('should work with custom conditions', () => {
      const mockFn = vi.fn()
      const batchFn = liteBatch(mockFn, {
        getShouldExecute: (items: any[]) =>
          items.some((item) => item.priority === 'high'),
        started: false,
      })

      batchFn({ name: 'task1', priority: 'low' })
      batchFn({ name: 'task2', priority: 'medium' })
      expect(mockFn).not.toHaveBeenCalled()

      batchFn({ name: 'task3', priority: 'high' })
      expect(mockFn).toHaveBeenCalledWith([
        { name: 'task1', priority: 'low' },
        { name: 'task2', priority: 'medium' },
        { name: 'task3', priority: 'high' },
      ])
    })

    it('should work with all triggers combined', () => {
      const mockFn = vi.fn()
      const batchFn = liteBatch(mockFn, {
        maxSize: 5,
        wait: 1000,
        getShouldExecute: (items: any[]) => items.some((item) => item.urgent),
        started: false,
      })

      // Test size trigger
      for (let i = 0; i < 5; i++) {
        batchFn({ id: i, urgent: false })
      }
      expect(mockFn).toHaveBeenCalledTimes(1)

      // Test custom condition trigger
      batchFn({ id: 'urgent', urgent: true })
      expect(mockFn).toHaveBeenCalledTimes(2)

      // Test time trigger
      batchFn({ id: 'delayed', urgent: false })
      vi.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('Callbacks', () => {
    it('should work with onExecute callback', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batchFn = liteBatch(mockFn, {
        maxSize: 2,
        started: false,
        onExecute,
      })

      batchFn('item1')
      batchFn('item2') // Should trigger execution

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should work with onItemsChange callback', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batchFn = liteBatch(mockFn, {
        started: false,
        onItemsChange,
      })

      batchFn('item1')
      batchFn('item2')

      expect(onItemsChange).toHaveBeenCalledTimes(2)
    })

    it('should work with both callbacks together', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onItemsChange = vi.fn()
      const batchFn = liteBatch(mockFn, {
        maxSize: 2,
        started: false,
        onExecute,
        onItemsChange,
      })

      batchFn('item1')
      batchFn('item2') // Should trigger execution

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onItemsChange).toHaveBeenCalledTimes(3) // 2 adds + 1 clear
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should work with time-based batching and onExecute', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batchFn = liteBatch(mockFn, {
        wait: 100,
        started: false,
        onExecute,
      })

      batchFn('item1')
      batchFn('item2')

      expect(onExecute).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith(['item1', 'item2'])
    })

    it('should work with custom execution conditions and callbacks', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const onItemsChange = vi.fn()
      const batchFn = liteBatch(mockFn, {
        getShouldExecute: (items: any[]) => items.some((item) => item.urgent),
        started: false,
        onExecute,
        onItemsChange,
      })

      batchFn({ name: 'normal', urgent: false })
      batchFn({ name: 'urgent', urgent: true }) // Should trigger

      expect(onExecute).toHaveBeenCalledTimes(1)
      expect(onItemsChange).toHaveBeenCalledTimes(3) // 2 adds + 1 clear
      expect(mockFn).toHaveBeenCalledWith([
        { name: 'normal', urgent: false },
        { name: 'urgent', urgent: true },
      ])
    })
  })
})
