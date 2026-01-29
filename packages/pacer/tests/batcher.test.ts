import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Batcher, batch } from '../src/batcher'

describe('Batcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {})

      expect(batcher.store.state.executionCount).toBe(0)
      expect(batcher.store.state.isEmpty).toBe(true)
      expect(batcher.store.state.isPending).toBe(false)
      expect(batcher.store.state.items).toEqual([])
      expect(batcher.store.state.size).toBe(0)
      expect(batcher.store.state.status).toBe('idle')
      expect(batcher.store.state.totalItemsProcessed).toBe(0)
    })

    it('should accept initial state values', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {
        initialState: {
          executionCount: 5,
          totalItemsProcessed: 10,
        },
      })

      expect(batcher.store.state.executionCount).toBe(5)
      expect(batcher.store.state.totalItemsProcessed).toBe(10)
      expect(batcher.store.state.isEmpty).toBe(true)
      expect(batcher.store.state.size).toBe(0)
    })

    it('should update state when items are added', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { wait: 1000 })

      batcher.addItem('test')

      expect(batcher.store.state.isEmpty).toBe(false)
      expect(batcher.store.state.size).toBe(1)
      expect(batcher.store.state.items).toEqual(['test'])
      expect(batcher.store.state.isPending).toBe(true)
      expect(batcher.store.state.status).toBe('pending')
    })

    it('should compute isEmpty and size from items array', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 5 })

      expect(batcher.store.state.isEmpty).toBe(true)
      expect(batcher.store.state.size).toBe(0)

      batcher.addItem(1)
      batcher.addItem(2)

      expect(batcher.store.state.isEmpty).toBe(false)
      expect(batcher.store.state.size).toBe(2)
    })

    it('should update execution count and total items processed after batch execution', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 2 })

      batcher.addItem(1)
      batcher.addItem(2) // Should trigger execution

      expect(batcher.store.state.executionCount).toBe(1)
      expect(batcher.store.state.totalItemsProcessed).toBe(2)
    })
  })

  describe('Options Behavior', () => {
    it('should use default options when not specified', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {})

      expect(batcher.options.maxSize).toBe(Infinity)
      expect(batcher.options.wait).toBe(Infinity)
      expect(batcher.options.started).toBe(true)
      expect(batcher.options.deduplicateItems).toBe(false)
      expect(batcher.options.deduplicateStrategy).toBe('keep-first')
      expect(typeof batcher.options.getShouldExecute).toBe('function')
    })

    it('should respect maxSize option', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 2 })

      batcher.addItem(1)
      expect(mockFn).not.toHaveBeenCalled()

      batcher.addItem(2)
      expect(mockFn).toHaveBeenCalledWith([1, 2])
    })

    it('should respect wait option', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { wait: 1000 })

      batcher.addItem(1)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(999)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(mockFn).toHaveBeenCalledWith([1])
    })

    it('should support dynamic wait function', () => {
      const mockFn = vi.fn()
      const waitFn = vi.fn().mockReturnValue(500)
      const batcher = new Batcher(mockFn, { wait: waitFn })

      batcher.addItem(1)
      expect(waitFn).toHaveBeenCalledWith(batcher)

      vi.advanceTimersByTime(500)
      expect(mockFn).toHaveBeenCalledWith([1])
    })

    it('should use getShouldExecute for custom execution logic', () => {
      const mockFn = vi.fn()
      const getShouldExecute = vi.fn().mockReturnValue(true)
      const batcher = new Batcher(mockFn, { getShouldExecute })

      batcher.addItem(1)
      expect(getShouldExecute).toHaveBeenCalledWith([1], batcher)
      expect(mockFn).toHaveBeenCalledWith([1])
    })

    it('should call onExecute callback after batch execution', () => {
      const mockFn = vi.fn()
      const onExecute = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 1, onExecute })

      batcher.addItem(1)
      expect(onExecute).toHaveBeenCalledWith([1], batcher)
    })

    it('should call onItemsChange callback when items change', () => {
      const mockFn = vi.fn()
      const onItemsChange = vi.fn()
      const batcher = new Batcher(mockFn, { onItemsChange })

      batcher.addItem(1)
      expect(onItemsChange).toHaveBeenCalledWith(batcher)
    })

    it('should update options with setOptions', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 5 })

      expect(batcher.options.maxSize).toBe(5)

      batcher.setOptions({ maxSize: 10 })
      expect(batcher.options.maxSize).toBe(10)
    })
  })

  describe('Method Execution', () => {
    describe('addItem', () => {
      it('should add item to the batch', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem('test')

        expect(batcher.store.state.items).toEqual(['test'])
        expect(batcher.store.state.size).toBe(1)
      })

      it('should add multiple items in order', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        batcher.addItem(2)
        batcher.addItem(3)

        expect(batcher.store.state.items).toEqual([1, 2, 3])
      })

      it('should trigger execution when maxSize is reached', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { maxSize: 2 })

        batcher.addItem(1)
        batcher.addItem(2)

        expect(mockFn).toHaveBeenCalledWith([1, 2])
        expect(batcher.store.state.items).toEqual([])
      })

      it('should clear existing timeout when new item is added', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        vi.advanceTimersByTime(500)

        batcher.addItem(2)
        vi.advanceTimersByTime(500)
        expect(mockFn).not.toHaveBeenCalled()

        vi.advanceTimersByTime(500)
        expect(mockFn).toHaveBeenCalledWith([1, 2])
      })

      it('should return true when item is added', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        const result = batcher.addItem(1)
        expect(result).toBe(true)
      })
    })

    describe('flush', () => {
      it('should execute batch immediately', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        batcher.addItem(2)

        expect(mockFn).not.toHaveBeenCalled()

        batcher.flush()
        expect(mockFn).toHaveBeenCalledWith([1, 2])
      })

      it('should clear pending timeout when flushing', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        batcher.flush()

        // Advance time to ensure timeout would have fired
        vi.advanceTimersByTime(1000)

        expect(mockFn).toHaveBeenCalledTimes(1)
      })

      it('should do nothing when batch is empty', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, {})

        batcher.flush()
        expect(mockFn).not.toHaveBeenCalled()
      })
    })

    describe('peekAllItems', () => {
      it('should return copy of all items without removing them', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        batcher.addItem(2)

        const items = batcher.peekAllItems()
        expect(items).toEqual([1, 2])
        expect(batcher.store.state.items).toEqual([1, 2])

        // Ensure it's a copy, not the same array
        items.push(3)
        expect(batcher.store.state.items).toEqual([1, 2])
      })

      it('should return empty array when no items', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, {})

        expect(batcher.peekAllItems()).toEqual([])
      })
    })

    describe('clear', () => {
      it('should remove all items from batch', () => {
        const mockFn = vi.fn()
        const batcher = new Batcher(mockFn, { wait: 1000 })

        batcher.addItem(1)
        batcher.addItem(2)

        batcher.clear()

        expect(batcher.store.state.items).toEqual([])
        expect(batcher.store.state.size).toBe(0)
        expect(batcher.store.state.isEmpty).toBe(true)
        expect(batcher.store.state.isPending).toBe(false)
      })
    })

    describe('reset', () => {
      it('should reset all state to defaults', () => {
        const mockFn = vi.fn()
        const onItemsChange = vi.fn()
        const batcher = new Batcher(mockFn, { maxSize: 2, onItemsChange })

        batcher.addItem(1)
        batcher.addItem(2) // Triggers execution

        expect(batcher.store.state.executionCount).toBe(1)
        expect(batcher.store.state.totalItemsProcessed).toBe(2)

        batcher.reset()

        expect(batcher.store.state.executionCount).toBe(0)
        expect(batcher.store.state.isEmpty).toBe(true)
        expect(batcher.store.state.isPending).toBe(false)
        expect(batcher.store.state.items).toEqual([])
        expect(batcher.store.state.size).toBe(0)
        expect(batcher.store.state.status).toBe('idle')
        expect(batcher.store.state.totalItemsProcessed).toBe(0)
        expect(onItemsChange).toHaveBeenCalledWith(batcher)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive adds with maxSize', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 3 })

      batcher.addItem(1)
      batcher.addItem(2)
      batcher.addItem(3) // Should trigger
      batcher.addItem(4)
      batcher.addItem(5)
      batcher.addItem(6) // Should trigger again

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(1, [1, 2, 3])
      expect(mockFn).toHaveBeenNthCalledWith(2, [4, 5, 6])
    })

    it('should handle getShouldExecute returning false', () => {
      const mockFn = vi.fn()
      const getShouldExecute = vi.fn().mockReturnValue(false)
      const batcher = new Batcher(mockFn, { getShouldExecute, wait: 1000 })

      batcher.addItem(1)
      expect(getShouldExecute).toHaveBeenCalledWith([1], batcher)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledWith([1])
    })

    it('should handle execution with empty items array', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {})

      batcher.flush()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle wait: Infinity (no timeout)', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { wait: Infinity })

      batcher.addItem(1)
      expect(batcher.store.state.isPending).toBe(false)

      vi.advanceTimersByTime(10000)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle multiple timeouts correctly', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { wait: 1000 })

      batcher.addItem(1)
      vi.advanceTimersByTime(500)

      batcher.addItem(2)
      vi.advanceTimersByTime(500)

      batcher.addItem(3)
      vi.advanceTimersByTime(1000)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith([1, 2, 3])
    })

    it('should preserve item order during batch execution', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 5 })

      batcher.addItem('a')
      batcher.addItem('b')
      batcher.addItem('c')
      batcher.addItem('d')
      batcher.addItem('e')

      expect(mockFn).toHaveBeenCalledWith(['a', 'b', 'c', 'd', 'e'])
    })

    it('should handle concurrent execution attempts', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, { maxSize: 2 })

      batcher.addItem(1)
      batcher.addItem(2) // Triggers execution

      // Try to flush while already executed
      batcher.flush()

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith([1, 2])
    })
  })
})

describe('batch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create and return batcher addItem function', () => {
    const mockFn = vi.fn()
    const batchItems = batch(mockFn, { maxSize: 2 })

    expect(typeof batchItems).toBe('function')

    batchItems(1)
    batchItems(2)

    expect(mockFn).toHaveBeenCalledWith([1, 2])
  })

  it('should work with different options', () => {
    const mockFn = vi.fn()
    const batchItems = batch(mockFn, { wait: 1000 })

    batchItems('test')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(mockFn).toHaveBeenCalledWith(['test'])
  })
})

describe('Batcher Deduplication', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not deduplicate by default', () => {
    const mockFn = vi.fn()
    const batcher = new Batcher(mockFn, { maxSize: 5 })

    batcher.addItem(1)
    batcher.addItem(1)
    batcher.addItem(2)

    expect(batcher.store.state.items).toEqual([1, 1, 2])
    expect(batcher.store.state.size).toBe(3)
  })

  describe('In-Batch Deduplication', () => {
    it('should deduplicate primitive items in the same batch with keep-first strategy', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {
        maxSize: 5,
        deduplicateItems: true,
      })

      batcher.addItem(1)
      batcher.addItem(2)
      batcher.addItem(1) // Duplicate in current batch
      batcher.addItem(3)

      expect(batcher.store.state.items).toEqual([1, 2, 3])
      expect(batcher.store.state.size).toBe(3)
    })

    it('should deduplicate with keep-last strategy', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher(mockFn, {
        maxSize: 5,
        deduplicateItems: true,
        deduplicateStrategy: 'keep-last',
      })

      batcher.addItem('a')
      batcher.addItem('b')
      batcher.addItem('a') // Should replace first 'a'

      expect(batcher.store.state.items).toEqual(['a', 'b'])
      expect(batcher.store.state.size).toBe(2)
    })

    it('should deduplicate objects with custom getItemKey', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher<{ id: number; name: string }>(mockFn, {
        maxSize: 5,
        deduplicateItems: true,
        getItemKey: (item) => item.id,
      })

      batcher.addItem({ id: 1, name: 'Alice' })
      batcher.addItem({ id: 2, name: 'Bob' })
      batcher.addItem({ id: 1, name: 'Alice Updated' }) // Duplicate id in batch

      expect(batcher.store.state.items).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])
      expect(batcher.store.state.size).toBe(2)
    })

    it('should replace item with keep-last strategy', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher<{ id: string; value: number }>(mockFn, {
        maxSize: 5,
        deduplicateItems: true,
        deduplicateStrategy: 'keep-last',
        getItemKey: (item) => item.id,
      })

      const item1 = { id: 'user-1', value: 100 }
      const item2 = { id: 'user-2', value: 200 }
      const item1Updated = { id: 'user-1', value: 150 }

      batcher.addItem(item1)
      batcher.addItem(item2)
      batcher.addItem(item1Updated) // Should replace item1 in batch

      expect(batcher.store.state.items).toEqual([
        { id: 'user-1', value: 150 },
        { id: 'user-2', value: 200 },
      ])
    })

    it('should handle objects with JSON.stringify when no getItemKey', () => {
      const mockFn = vi.fn()
      const batcher = new Batcher<{ x: number }>(mockFn, {
        maxSize: 5,
        deduplicateItems: true,
      })

      batcher.addItem({ x: 1 })
      batcher.addItem({ x: 2 })
      batcher.addItem({ x: 1 }) // Same object structure, should be deduplicated

      expect(batcher.store.state.items).toEqual([{ x: 1 }, { x: 2 }])
      expect(batcher.store.state.size).toBe(2)
    })
  })
})
