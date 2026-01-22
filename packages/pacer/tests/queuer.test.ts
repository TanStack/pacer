import { describe, expect, it, vi } from 'vitest'
import { Queuer } from '../src/queuer'

describe('Queuer', () => {
  it('should create an empty queuer', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { started: false })
    expect(queuer.store.state.isEmpty).toBe(true)
    expect(queuer.store.state.size).toBe(0)
  })

  it('should start with started: true by default', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, {})
    expect(queuer.store.state.isRunning).toBe(true)
  })

  it('should respect maxSize option', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { maxSize: 2, started: false })
    expect(queuer.addItem(1)).toBe(true)
    expect(queuer.addItem(2)).toBe(true)
    expect(queuer.addItem(3)).toBe(false)
    expect(queuer.store.state.size).toBe(2)
  })

  it('should initialize with default state including processedKeys', () => {
    const fn = vi.fn()
    const queuer = new Queuer(fn, { started: false })

    expect(queuer.store.state.processedKeys).toEqual([])
  })

  describe('addItem', () => {
    it('should add items to the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.store.state.size).toBe(1)
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
      expect(queuer.store.state.size).toBe(2)
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
      expect(queuer.store.state.isEmpty).toBe(true)
    })

    it('should return false when queuer has items', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      expect(queuer.store.state.isEmpty).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queuer reaches maxSize', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 2, started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(queuer.store.state.isFull).toBe(true)
    })

    it('should return false when queuer is not full', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 2, started: false })
      queuer.addItem(1)
      expect(queuer.store.state.isFull).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      queuer.clear()

      expect(queuer.store.state.isEmpty).toBe(true)
      expect(queuer.store.state.size).toBe(0)
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
        expect(queuer.store.state.size).toBe(3)
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
        expect(queuer.store.state.isEmpty).toBe(true)
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

      it('should handle priority correctly with LIFO (getItemsFrom: back)', () => {
        const queuer = new Queuer(() => {}, {
          started: false,
          addItemsTo: 'back',
          getItemsFrom: 'back', // LIFO order
          getPriority: (item: any) => item.priority,
        })

        // Add items - this mimics the original issue scenario
        queuer.addItem({ value: 'medium first', priority: 2 })
        queuer.addItem({ value: 'high', priority: 3 })
        queuer.addItem({ value: 'medium second', priority: 2 })
        queuer.addItem({ value: 'low', priority: 1 })

        // Even with LIFO setting, priority should override and return highest priority first
        expect(queuer.getNextItem()).toEqual({ value: 'high', priority: 3 })
        expect(queuer.getNextItem()).toEqual({
          value: 'medium first',
          priority: 2,
        })
        expect(queuer.getNextItem()).toEqual({
          value: 'medium second',
          priority: 2,
        })
        expect(queuer.getNextItem()).toEqual({ value: 'low', priority: 1 })
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
    expect(queuer.store.state.size).toBe(3)

    // Remove from both ends
    expect(queuer.execute('front')).toBe(2)
    expect(queuer.execute('back')).toBe(3)
    expect(queuer.execute('front')).toBe(1)
  })

  describe('reset', () => {
    it('should reset the queuer to its initial state', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { initialItems: [1, 2], started: false })
      queuer.addItem(3)
      queuer.reset()
      expect(queuer.peekAllItems()).toEqual([])
    })

    it('should also reset processedKeys', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.execute() // processedKeys = [1]

      expect(queuer.store.state.processedKeys).toEqual([1])

      queuer.reset()

      expect(queuer.store.state.processedKeys).toEqual([])
    })
  })

  describe('start', () => {
    it('should start the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false })
      expect(queuer.store.state.isRunning).toBe(false)
      queuer.start()
      expect(queuer.store.state.isRunning).toBe(true)
    })
  })

  describe('stop', () => {
    it('should stop the queuer', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: true })
      expect(queuer.store.state.isRunning).toBe(true)
      queuer.stop()
      expect(queuer.store.state.isRunning).toBe(false)
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
      expect(queuer.store.state.executionCount).toBe(2)
    })
  })

  describe('getRejectionCount', () => {
    it('should return the number of rejected items', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { maxSize: 1, started: false })
      queuer.addItem(1)
      queuer.addItem(2)
      expect(queuer.store.state.rejectionCount).toBe(1)
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
  })

  describe('Flush Methods', () => {
    describe('flush', () => {
      it('should process all items immediately', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { wait: 1000, started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        expect(fn).not.toHaveBeenCalled()

        queuer.flush()

        expect(fn).toHaveBeenCalledTimes(3)
        expect(fn).toHaveBeenNthCalledWith(1, 1)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(fn).toHaveBeenNthCalledWith(3, 3)
        expect(queuer.store.state.isEmpty).toBe(true)
      })

      it('should process specified number of items', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        queuer.flush(2)

        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenNthCalledWith(1, 1)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(queuer.store.state.size).toBe(1)
        expect(queuer.peekNextItem()).toBe(3)
      })

      it('should clear pending timeout when flushing', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { wait: 1000, started: false })

        queuer.addItem(1)
        queuer.start()

        // Flush should clear any pending timeout
        queuer.flush()

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(1)
      })

      it('should work with position parameter', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        queuer.flush(2, 'back')

        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenNthCalledWith(1, 3)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(queuer.store.state.size).toBe(1)
        expect(queuer.peekNextItem()).toBe(1)
      })

      it('should do nothing when queue is empty', () => {
        const fn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.flush()
        expect(fn).not.toHaveBeenCalled()
      })
    })

    describe('flushAsBatch', () => {
      it('should process all items as a batch', () => {
        const fn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)
        queuer.addItem(3)

        queuer.flushAsBatch(batchFn)

        expect(fn).not.toHaveBeenCalled()
        expect(batchFn).toHaveBeenCalledTimes(1)
        expect(batchFn).toHaveBeenCalledWith([1, 2, 3])
        expect(queuer.store.state.isEmpty).toBe(true)
      })

      it('should clear queue after batch processing', () => {
        const fn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.addItem(1)
        queuer.addItem(2)

        expect(queuer.store.state.size).toBe(2)

        queuer.flushAsBatch(batchFn)

        expect(queuer.store.state.isEmpty).toBe(true)
        expect(queuer.store.state.size).toBe(0)
      })

      it('should handle empty queue', () => {
        const fn = vi.fn()
        const batchFn = vi.fn()
        const queuer = new Queuer(fn, { started: false })

        queuer.flushAsBatch(batchFn)

        expect(batchFn).toHaveBeenCalledTimes(1)
        expect(batchFn).toHaveBeenCalledWith([])
      })
    })
  })

  describe('In-Queue Deduplication', () => {
    it('should not deduplicate by default', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, { started: false, maxSize: 5 })

      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.addItem(1)).toBe(true)
      expect(queuer.addItem(2)).toBe(true)

      expect(queuer.store.state.items).toEqual([1, 1, 2])
      expect(queuer.store.state.size).toBe(3)
    })

    it('should deduplicate primitive items in current queue with keep-first strategy', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        maxSize: 5,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(1) // Duplicate in queue
      queuer.addItem(3)

      expect(queuer.store.state.items).toEqual([1, 2, 3])
      expect(queuer.store.state.size).toBe(3)
    })

    it('should deduplicate with keep-last strategy', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        maxSize: 5,
        deduplicateItems: true,
        deduplicateStrategy: 'keep-last',
      })

      queuer.addItem('a')
      queuer.addItem('b')
      queuer.addItem('a') // Should replace first 'a'

      expect(queuer.store.state.items).toEqual(['a', 'b'])
      expect(queuer.store.state.size).toBe(2)
    })

    it('should call onDuplicate callback for in-queue duplicates', () => {
      const fn = vi.fn()
      const onDuplicate = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        maxSize: 5,
        deduplicateItems: true,
        onDuplicate,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(1) // Duplicate in queue

      expect(onDuplicate).toHaveBeenCalledTimes(1)
      expect(onDuplicate).toHaveBeenCalledWith(1, 1, queuer)
    })

    it('should deduplicate before checking maxSize', () => {
      const fn = vi.fn()
      const onReject = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        maxSize: 2,
        deduplicateItems: true,
        onReject,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.addItem(1) // Duplicate in queue, should not trigger rejection

      expect(queuer.store.state.size).toBe(2)
      expect(onReject).not.toHaveBeenCalled()

      queuer.addItem(3) // Should be rejected

      expect(queuer.store.state.size).toBe(2)
      expect(onReject).toHaveBeenCalledWith(3, queuer)
    })
  })

  describe('Cross-Execution Deduplication', () => {
    it('should skip items that were already processed', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.execute() // Processes 1, processedKeys = [1]
      queuer.execute() // Processes 2, processedKeys = [1, 2]

      expect(fn).toHaveBeenCalledTimes(2)

      // Now try to add already processed items
      const result1 = queuer.addItem(1) // Should be skipped
      const result2 = queuer.addItem(2) // Should be skipped
      const result3 = queuer.addItem(3) // Should be added

      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(result3).toBe(true)

      expect(queuer.store.state.items).toEqual([3])
    })

    it('should call onDuplicate with undefined existingItem for cross-execution duplicates', () => {
      const fn = vi.fn()
      const onDuplicate = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
        onDuplicate,
      })

      queuer.addItem(1)
      queuer.execute() // Processes 1

      onDuplicate.mockClear()
      queuer.addItem(1) // Already processed

      expect(onDuplicate).toHaveBeenCalledTimes(1)
      expect(onDuplicate).toHaveBeenCalledWith(1, undefined, queuer)
    })

    it('should track processed keys with custom getItemKey', () => {
      const fn = vi.fn()
      const queuer = new Queuer<{ id: string; value: number }>(fn, {
        started: false,
        deduplicateItems: true,
        getItemKey: (item) => item.id,
      })

      queuer.addItem({ id: 'user-1', value: 100 })
      queuer.execute() // Processes user-1

      // Try to add same user with different value
      const result = queuer.addItem({ id: 'user-1', value: 150 })
      expect(result).toBe(false)

      // New user should be added
      const result2 = queuer.addItem({ id: 'user-2', value: 200 })
      expect(result2).toBe(true)
    })

    it('should respect maxTrackedKeys limit with FIFO eviction', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
        maxTrackedKeys: 3,
      })

      // Process items 1, 2, 3
      queuer.addItem(1)
      queuer.execute() // processedKeys = [1]
      queuer.addItem(2)
      queuer.execute() // processedKeys = [1, 2]
      queuer.addItem(3)
      queuer.execute() // processedKeys = [1, 2, 3]

      // Process item 4 - should evict key 1
      queuer.addItem(4)
      queuer.execute() // processedKeys = [2, 3, 4]

      expect(queuer.store.state.processedKeys).toEqual([2, 3, 4])

      // Item 1 should be processable again (evicted from tracking)
      const result = queuer.addItem(1)
      expect(result).toBe(true)
    })

    it('should provide peekProcessedKeys method', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.execute()
      queuer.execute()

      const keys = queuer.peekProcessedKeys()
      expect(keys).toEqual([1, 2])

      // Should be a copy
      keys.push(3)
      expect(queuer.store.state.processedKeys).toEqual([1, 2])
    })

    it('should provide hasProcessedKey method', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.addItem(2)
      queuer.execute()
      queuer.execute()

      expect(queuer.hasProcessedKey(1)).toBe(true)
      expect(queuer.hasProcessedKey(2)).toBe(true)
      expect(queuer.hasProcessedKey(3)).toBe(false)
    })

    it('should provide clearProcessedKeys method', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
      })

      queuer.addItem(1)
      queuer.execute()

      expect(queuer.store.state.processedKeys).toEqual([1])

      queuer.addItem(1) // Skipped

      queuer.clearProcessedKeys()

      expect(queuer.store.state.processedKeys).toEqual([])

      // Now item 1 should be addable again
      const result = queuer.addItem(1)
      expect(result).toBe(true)
    })

    it('should restore processedKeys from initialState', () => {
      const fn = vi.fn()
      const queuer = new Queuer(fn, {
        started: false,
        deduplicateItems: true,
        initialState: {
          processedKeys: ['task-1', 'task-2'],
        },
      })

      expect(queuer.store.state.processedKeys).toEqual(['task-1', 'task-2'])

      // These should be skipped
      const result1 = queuer.addItem('task-1')
      const result2 = queuer.addItem('task-2')
      expect(result1).toBe(false)
      expect(result2).toBe(false)

      // New item should be added
      const result3 = queuer.addItem('task-3')
      expect(result3).toBe(true)
    })

    it('should work with priority queue', () => {
      const fn = vi.fn()
      const queuer = new Queuer<{ id: string; priority: number }>(fn, {
        started: false,
        deduplicateItems: true,
        getItemKey: (item) => item.id,
        getPriority: (item) => item.priority,
      })

      queuer.addItem({ id: 'task-1', priority: 1 })
      queuer.addItem({ id: 'task-2', priority: 3 })
      queuer.execute() // Processes task-2 (highest priority)

      // task-2 should be skipped
      const result = queuer.addItem({ id: 'task-2', priority: 5 })
      expect(result).toBe(false)

      // task-1 should still be processable
      expect(queuer.store.state.items).toEqual([{ id: 'task-1', priority: 1 }])
    })
  })
})
