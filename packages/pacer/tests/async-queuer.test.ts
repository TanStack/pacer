import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncQueuer } from '../src'

describe('AsyncQueuer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create an empty async queuer and be started by default', () => {
    const asyncQueuer = new AsyncQueuer((item) => Promise.resolve(item), {})
    expect(asyncQueuer.store.state.isRunning).toBe(true)
    expect(asyncQueuer.store.state.isIdle).toBe(true)
    expect(asyncQueuer.store.state.items.length).toBe(0)
  })

  it('should respect started option', () => {
    const asyncQueuer = new AsyncQueuer((item) => Promise.resolve(item), {
      started: false,
    })
    expect(asyncQueuer.store.state.isRunning).toBe(false)
    expect(asyncQueuer.store.state.isIdle).toBe(false)
  })

  it('should respect maxSize option', () => {
    const asyncQueuer = new AsyncQueuer<string>(
      (item) => Promise.resolve(item),
      {
        maxSize: 1,
        started: false,
      },
    )
    expect(asyncQueuer.store.state.items.length).toBe(0)
    asyncQueuer.addItem('test')
    expect(asyncQueuer.store.state.items.length).toBe(1)
    expect(asyncQueuer.store.state.isFull).toBe(true)
  })

  describe('addItem', () => {
    it('should add items to the queuer', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('test')
      expect(asyncQueuer.store.state.items.length).toBe(1)
    })
    it('should reject items when full and call onReject', () => {
      const onReject = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          maxSize: 1,
          started: false,
          onReject,
        },
      )
      asyncQueuer.addItem('test')
      expect(asyncQueuer.store.state.items.length).toBe(1)
      expect(asyncQueuer.store.state.isFull).toBe(true)
      asyncQueuer.addItem('test2')
      expect(onReject).toHaveBeenCalledTimes(1)
      expect(asyncQueuer.store.state.items.length).toBe(1)
    })
  })

  describe('getNextItem', () => {
    it('should remove and return items in FIFO order', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')

      expect(asyncQueuer.getNextItem()).toBe('first')
      expect(asyncQueuer.getNextItem()).toBe('second')
      expect(asyncQueuer.getNextItem()).toBe('third')
      expect(asyncQueuer.getNextItem()).toBeUndefined()
    })

    it('should remove and return items in LIFO order when getItemsFrom is back', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
          getItemsFrom: 'back',
        },
      )
      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')

      expect(asyncQueuer.getNextItem()).toBe('third')
      expect(asyncQueuer.getNextItem()).toBe('second')
      expect(asyncQueuer.getNextItem()).toBe('first')
      expect(asyncQueuer.getNextItem()).toBeUndefined()
    })

    it('should remove and return items in LIFO order when position is explicitly set to back', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')

      expect(asyncQueuer.getNextItem('back')).toBe('third')
      expect(asyncQueuer.getNextItem('back')).toBe('second')
      expect(asyncQueuer.getNextItem('back')).toBe('first')
      expect(asyncQueuer.getNextItem('back')).toBeUndefined()
    })

    it('should return undefined when queuer is empty', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      expect(asyncQueuer.getNextItem()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return first item without removing it', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('first')
      expect(asyncQueuer.peekNextItem()).toBe('first')
      expect(asyncQueuer.peekNextItem()).toBe('first')
    })
    it('should return undefined when queuer is empty', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      expect(asyncQueuer.peekNextItem()).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('should return true when queuer is empty', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      expect(asyncQueuer.store.state.isEmpty).toBe(true)
    })
    it('should return false when queuer has items', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('test')
      expect(asyncQueuer.store.state.isEmpty).toBe(false)
    })
  })

  describe('isFull', () => {
    it('should return true when queuer reaches maxSize', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
          maxSize: 1,
        },
      )
      asyncQueuer.addItem('test')
      expect(asyncQueuer.store.state.isFull).toBe(true)
    })
    it('should return false when queuer is not full', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('test')
      expect(asyncQueuer.store.state.isFull).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all items from the queuer', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      asyncQueuer.addItem('test')
      asyncQueuer.clear()
      expect(asyncQueuer.store.state.items.length).toBe(0)
    })
  })

  describe('options', () => {
    describe('initialItems', () => {
      it('should initialize queuer with provided items', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            initialItems: ['test'],
          },
        )
        expect(asyncQueuer.store.state.items.length).toBe(1)
        expect(asyncQueuer.getNextItem()).toBe('test')
      })

      it('should sort initial items by priority if getPriority is provided', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            initialItems: ['low', 'high', 'medium'],
            getPriority: (item) => {
              switch (item) {
                case 'high':
                  return 3
                case 'medium':
                  return 2
                case 'low':
                  return 1
                default:
                  return 0
              }
            },
          },
        )
        expect(asyncQueuer.store.state.items.length).toBe(3)
        expect(asyncQueuer.getNextItem()).toBe('high')
        expect(asyncQueuer.getNextItem()).toBe('medium')
        expect(asyncQueuer.getNextItem()).toBe('low')
      })

      it('should handle empty initialItems array', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            initialItems: [],
          },
        )
        expect(asyncQueuer.store.state.items.length).toBe(0)
        expect(asyncQueuer.store.state.isEmpty).toBe(true)
      })
    })

    describe('getPriority', () => {
      it('should maintain priority order when adding items', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            getPriority: (item) => {
              switch (item) {
                case 'high':
                  return 3
                case 'medium':
                  return 2
                case 'low':
                  return 1
                default:
                  return 0
              }
            },
          },
        )

        asyncQueuer.addItem('low')
        asyncQueuer.addItem('high')
        asyncQueuer.addItem('medium')

        expect(asyncQueuer.getNextItem()).toBe('high')
        expect(asyncQueuer.getNextItem()).toBe('medium')
        expect(asyncQueuer.getNextItem()).toBe('low')
      })

      it('should insert items in correct position based on priority', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            getPriority: (item) => {
              if (item.includes('high')) return 3
              if (item.includes('medium')) return 2
              if (item.includes('low')) return 1
              return 0
            },
          },
        )

        asyncQueuer.addItem('low')
        asyncQueuer.addItem('medium')
        asyncQueuer.addItem('high')
        asyncQueuer.addItem('medium2')

        expect(asyncQueuer.getNextItem()).toBe('high')
        expect(asyncQueuer.getNextItem()).toBe('medium')
        expect(asyncQueuer.getNextItem()).toBe('medium2')
        expect(asyncQueuer.getNextItem()).toBe('low')
      })

      it('should handle items with equal priorities (FIFO)', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            getPriority: (_item) => 1, // All items have same priority
          },
        )

        asyncQueuer.addItem('first')
        asyncQueuer.addItem('second')
        asyncQueuer.addItem('third')

        expect(asyncQueuer.getNextItem()).toBe('first')
        expect(asyncQueuer.getNextItem()).toBe('second')
        expect(asyncQueuer.getNextItem()).toBe('third')
      })

      it('should ignore position parameter when priority is enabled', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            getPriority: (item) => {
              switch (item) {
                case 'high':
                  return 3
                case 'medium':
                  return 2
                case 'low':
                  return 1
                default:
                  return 0
              }
            },
          },
        )

        // Try to add high priority item to back
        asyncQueuer.addItem('low', 'back')
        asyncQueuer.addItem('high', 'back')
        asyncQueuer.addItem('medium', 'back')

        // Should still come out in priority order
        expect(asyncQueuer.getNextItem()).toBe('high')
        expect(asyncQueuer.getNextItem()).toBe('medium')
        expect(asyncQueuer.getNextItem()).toBe('low')
      })

      it('should handle priority correctly with LIFO (getItemsFrom: back)', () => {
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            addItemsTo: 'back',
            getItemsFrom: 'back', // LIFO order
            getPriority: (item) => {
              if (item.includes('high')) return 3
              if (item.includes('medium')) return 2
              if (item.includes('low')) return 1
              else return 0
            },
          },
        )

        // Add items - this mimics the original issue scenario
        asyncQueuer.addItem('medium first')
        asyncQueuer.addItem('high')
        asyncQueuer.addItem('medium second')
        asyncQueuer.addItem('low')

        // Even with LIFO setting, priority should override and return highest priority first
        expect(asyncQueuer.getNextItem()).toBe('high')
        expect(asyncQueuer.getNextItem()).toBe('medium first')
        expect(asyncQueuer.getNextItem()).toBe('medium second')
        expect(asyncQueuer.getNextItem()).toBe('low')
      })
    })

    describe('onItemsChange', () => {
      it('should call onItemsChange when items are added', () => {
        const onItemsChange = vi.fn()
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            onItemsChange,
          },
        )

        asyncQueuer.addItem('test')
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(asyncQueuer)
      })

      it('should call onItemsChange when items are removed', () => {
        const onItemsChange = vi.fn()
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            onItemsChange,
          },
        )

        asyncQueuer.addItem('test')
        onItemsChange.mockClear()
        asyncQueuer.getNextItem()
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(asyncQueuer)
      })

      it('should call onItemsChange when queuer is cleared', () => {
        const onItemsChange = vi.fn()
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            onItemsChange,
          },
        )

        asyncQueuer.addItem('test')
        onItemsChange.mockClear()
        asyncQueuer.clear()
        expect(onItemsChange).toHaveBeenCalledTimes(1)
        expect(onItemsChange).toHaveBeenCalledWith(asyncQueuer)
      })

      it('should not call onItemsChange when dequeuing from empty queuer', () => {
        const onItemsChange = vi.fn()
        const asyncQueuer = new AsyncQueuer<string>(
          (item) => Promise.resolve(item),
          {
            started: false,
            onItemsChange,
          },
        )

        onItemsChange.mockClear()
        asyncQueuer.getNextItem()
        expect(onItemsChange).not.toHaveBeenCalled()
      })
    })
  })

  it('should support stack-like (LIFO) operations', () => {
    const asyncQueuer = new AsyncQueuer<string>(
      (item) => Promise.resolve(item),
      {
        started: false,
        getItemsFrom: 'back',
        addItemsTo: 'back',
      },
    )

    asyncQueuer.addItem('first')
    asyncQueuer.addItem('second')
    asyncQueuer.addItem('third')

    expect(asyncQueuer.getNextItem()).toBe('third')
    expect(asyncQueuer.getNextItem()).toBe('second')
    expect(asyncQueuer.getNextItem()).toBe('first')
    expect(asyncQueuer.getNextItem()).toBeUndefined()
  })

  it('should support double-ended operations', () => {
    const asyncQueuer = new AsyncQueuer<string>(
      (item) => Promise.resolve(item),
      {
        started: false,
      },
    )

    // Add to front
    asyncQueuer.addItem('first', 'front')
    asyncQueuer.addItem('second', 'front')
    asyncQueuer.addItem('third', 'front')

    // Remove from back
    expect(asyncQueuer.getNextItem('back')).toBe('first')
    expect(asyncQueuer.getNextItem('back')).toBe('second')
    expect(asyncQueuer.getNextItem('back')).toBe('third')
    expect(asyncQueuer.getNextItem('back')).toBeUndefined()

    // Add to back
    asyncQueuer.addItem('fourth', 'back')
    asyncQueuer.addItem('fifth', 'back')
    asyncQueuer.addItem('sixth', 'back')

    // Remove from front
    expect(asyncQueuer.getNextItem('front')).toBe('fourth')
    expect(asyncQueuer.getNextItem('front')).toBe('fifth')
    expect(asyncQueuer.getNextItem('front')).toBe('sixth')
    expect(asyncQueuer.getNextItem('front')).toBeUndefined()
  })

  describe('start', () => {
    it('should start the queuer', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
        },
      )
      expect(asyncQueuer.store.state.isRunning).toBe(false)
      asyncQueuer.start()
      expect(asyncQueuer.store.state.isRunning).toBe(true)
    })
  })

  describe('stop', () => {
    it('should stop the queuer', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: true,
        },
      )
      expect(asyncQueuer.store.state.isRunning).toBe(true)
      asyncQueuer.stop()
      expect(asyncQueuer.store.state.isRunning).toBe(false)
    })
  })

  describe('getSuccessCount', () => {
    it('should return the number of successfully processed items', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { started: false },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      await asyncQueuer.execute()
      await asyncQueuer.execute()
      expect(asyncQueuer.store.state.successCount).toBe(2)
    })
  })

  describe('getErrorCount', () => {
    it('should return the number of items that failed processing', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (_item) => Promise.reject(new Error('test error')),
        { started: false, throwOnError: false },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      await asyncQueuer.execute()
      await asyncQueuer.execute()
      expect(asyncQueuer.store.state.errorCount).toBe(2)
    })
  })

  describe('getSettledCount', () => {
    it('should return the number of items that have completed processing', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { started: false },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      await asyncQueuer.execute()
      await asyncQueuer.execute()
      expect(asyncQueuer.store.state.settledCount).toBe(2)
    })
  })

  describe('getRejectionCount', () => {
    it('should return the number of rejected items', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { maxSize: 1, started: false },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      asyncQueuer.addItem('test3')
      expect(asyncQueuer.store.state.rejectionCount).toBe(2)
    })
  })

  describe('getExpirationCount', () => {
    it('should return the number of expired items', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
          expirationDuration: 100,
          getIsExpired: (_, addedAt) => Date.now() - addedAt > 100,
        },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      await vi.advanceTimersByTimeAsync(200)
      asyncQueuer.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(asyncQueuer.store.state.expirationCount).toBe(2)
    })
  })

  describe('callbacks', () => {
    it('should call onSuccess when a task succeeds', async () => {
      const onSuccess = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { started: false, onSuccess },
      )
      asyncQueuer.addItem('test')
      await asyncQueuer.execute()
      expect(onSuccess).toHaveBeenCalledWith('test', 'test', asyncQueuer)
    })

    it('should call onError when a task throws', async () => {
      const onError = vi.fn()
      const error = new Error('test error')
      const asyncQueuer = new AsyncQueuer<string>(() => Promise.reject(error), {
        started: false,
        onError,
      })
      asyncQueuer.addItem('test')
      await asyncQueuer.execute()
      expect(onError).toHaveBeenCalledWith(error, 'test', asyncQueuer)
    })

    it('should call onSettled after a task is settled', async () => {
      const onSettled = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { started: false, onSettled },
      )
      asyncQueuer.addItem('test')
      await asyncQueuer.execute()
      expect(onSettled).toHaveBeenCalledWith('test', asyncQueuer)
    })

    it('should call onExpire when an item expires', async () => {
      const onExpire = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        {
          started: false,
          expirationDuration: 100,
          getIsExpired: (_, addedAt) => Date.now() - addedAt > 100,
          onExpire,
        },
      )
      asyncQueuer.addItem('test')
      await vi.advanceTimersByTimeAsync(200)
      asyncQueuer.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(onExpire).toHaveBeenCalledWith('test', asyncQueuer)
    })

    it('should call onReject when an item is rejected', () => {
      const onReject = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        (item) => Promise.resolve(item),
        { maxSize: 1, started: false, onReject },
      )
      asyncQueuer.addItem('test1')
      asyncQueuer.addItem('test2')
      expect(onReject).toHaveBeenCalledWith('test2', asyncQueuer)
    })
  })

  describe('concurrency', () => {
    it('should process up to the concurrency limit in parallel', async () => {
      const results: Array<string> = []
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          results.push(item)
          return item
        },
        { concurrency: 2, started: false },
      )

      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(150)
      expect(results).toHaveLength(2)
      expect(results).toContain('first')
      expect(results).toContain('second')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(3)
      expect(results).toContain('third')
    })

    it('should process items sequentially if concurrency is 1', async () => {
      const results: Array<string> = []
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          results.push(item)
          return item
        },
        { concurrency: 1, started: false },
      )

      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(150)
      expect(results).toHaveLength(1)
      expect(results[0]).toBe('first')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(2)
      expect(results[1]).toBe('second')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(3)
      expect(results[2]).toBe('third')
    })

    it('should respect dynamic concurrency function', async () => {
      const results: Array<string> = []
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          results.push(item)
          return item
        },
        {
          concurrency: (queuer) =>
            queuer.store.state.items.length > 1 ? 2 : 1,
          started: false,
        },
      )

      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(150)
      expect(results).toHaveLength(2)
      expect(results).toContain('first')
      expect(results).toContain('second')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(3)
      expect(results).toContain('third')
    })
  })

  describe('wait', () => {
    it('should wait the specified time between processing items', async () => {
      const results: Array<string> = []
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          results.push(item)
          return item
        },
        {
          wait: 100,
          started: false,
        },
      )

      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(50)
      expect(results).toHaveLength(1)
      expect(results[0]).toBe('first')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(2)
      expect(results[1]).toBe('second')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(3)
      expect(results[2]).toBe('third')
    })

    it('should respect dynamic wait function', async () => {
      const results: Array<string> = []
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          results.push(item)
          return item
        },
        {
          wait: (queuer) => (queuer.store.state.items.length > 1 ? 100 : 50),
          started: false,
        },
      )

      asyncQueuer.addItem('first')
      asyncQueuer.addItem('second')
      asyncQueuer.addItem('third')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(50)
      expect(results).toHaveLength(1)
      expect(results[0]).toBe('first')

      await vi.advanceTimersByTimeAsync(99)
      expect(results).toHaveLength(2)
      expect(results[1]).toBe('second')

      await vi.advanceTimersByTimeAsync(100)
      expect(results).toHaveLength(3)
      expect(results[2]).toBe('third')
    })
  })

  describe('error handling', () => {
    it('should throw if throwOnError is true and no onError handler', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        () => {
          throw new Error('test error')
        },
        {
          started: false,
          throwOnError: true,
        },
      )

      asyncQueuer.addItem('test')
      await expect(asyncQueuer.execute()).rejects.toThrow('test error')
    })

    it('should not throw if throwOnError is false and onError handler is provided', async () => {
      const onError = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        () => {
          throw new Error('test error')
        },
        {
          started: false,
          throwOnError: false,
          onError,
        },
      )

      asyncQueuer.addItem('test')
      await asyncQueuer.start()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        'test',
        asyncQueuer,
      )
    })

    it('should call onError before throwing if both are set', async () => {
      const onError = vi.fn()
      const asyncQueuer = new AsyncQueuer<string>(
        () => {
          throw new Error('test error')
        },
        {
          started: false,
          throwOnError: true,
          onError,
        },
      )

      asyncQueuer.addItem('test')
      await expect(asyncQueuer.execute()).rejects.toThrow('test error')
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        'test',
        asyncQueuer,
      )
    })
  })

  describe('Flush Methods', () => {
    describe('flush', () => {
      it('should process all items immediately', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const asyncQueuer = new AsyncQueuer(fn, { wait: 1000, started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)
        asyncQueuer.addItem(3)

        expect(fn).not.toHaveBeenCalled()

        await asyncQueuer.flush()

        expect(fn).toHaveBeenCalledTimes(3)
        expect(fn).toHaveBeenNthCalledWith(1, 1)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(fn).toHaveBeenNthCalledWith(3, 3)
        expect(asyncQueuer.store.state.isEmpty).toBe(true)
      })

      it('should process specified number of items', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)
        asyncQueuer.addItem(3)

        await asyncQueuer.flush(2)

        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenNthCalledWith(1, 1)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(asyncQueuer.store.state.size).toBe(1)
        expect(asyncQueuer.peekNextItem()).toBe(3)
      })

      it('should clear pending timeouts when flushing', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const asyncQueuer = new AsyncQueuer(fn, { wait: 1000, started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.start()

        // Flush should clear any pending timeouts
        await asyncQueuer.flush()

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(1)
      })

      it('should work with position parameter', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)
        asyncQueuer.addItem(3)

        await asyncQueuer.flush(2, 'back')

        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenNthCalledWith(1, 3)
        expect(fn).toHaveBeenNthCalledWith(2, 2)
        expect(asyncQueuer.store.state.size).toBe(1)
        expect(asyncQueuer.peekNextItem()).toBe(1)
      })

      it('should handle async execution errors', async () => {
        const fn = vi
          .fn()
          .mockResolvedValueOnce('success')
          .mockRejectedValueOnce(new Error('test error'))
          .mockResolvedValueOnce('success2')

        const asyncQueuer = new AsyncQueuer(fn, {
          started: false,
          onError: () => {},
          throwOnError: false,
        })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)
        asyncQueuer.addItem(3)

        await asyncQueuer.flush()

        expect(fn).toHaveBeenCalledTimes(3)
        expect(asyncQueuer.store.state.errorCount).toBe(1)
        expect(asyncQueuer.store.state.successCount).toBe(2)
      })

      it('should do nothing when queue is empty', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        await asyncQueuer.flush()
        expect(fn).not.toHaveBeenCalled()
      })
    })

    describe('flushAsBatch', () => {
      it('should process all items as a batch', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const batchFn = vi.fn().mockResolvedValue('batch-result')
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)
        asyncQueuer.addItem(3)

        await asyncQueuer.flushAsBatch(batchFn)

        expect(fn).not.toHaveBeenCalled()
        expect(batchFn).toHaveBeenCalledTimes(1)
        expect(batchFn).toHaveBeenCalledWith([1, 2, 3])
        expect(asyncQueuer.store.state.isEmpty).toBe(true)
      })

      it('should clear timeouts before batch processing', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const batchFn = vi.fn().mockResolvedValue('batch-result')
        const asyncQueuer = new AsyncQueuer(fn, { wait: 1000, started: false })

        asyncQueuer.addItem(1)

        // flushAsBatch should clear any pending timeouts and process items as batch
        await asyncQueuer.flushAsBatch(batchFn)

        expect(fn).not.toHaveBeenCalled()
        expect(batchFn).toHaveBeenCalledTimes(1)
        expect(batchFn).toHaveBeenCalledWith([1])
      })

      it('should handle batch function errors', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const batchFn = vi.fn().mockRejectedValue(new Error('batch error'))
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        asyncQueuer.addItem(1)
        asyncQueuer.addItem(2)

        await expect(asyncQueuer.flushAsBatch(batchFn)).rejects.toThrow(
          'batch error',
        )
        expect(batchFn).toHaveBeenCalledWith([1, 2])
      })

      it('should handle empty queue', async () => {
        const fn = vi.fn().mockResolvedValue('result')
        const batchFn = vi.fn().mockResolvedValue('batch-result')
        const asyncQueuer = new AsyncQueuer(fn, { started: false })

        await asyncQueuer.flushAsBatch(batchFn)

        expect(batchFn).toHaveBeenCalledTimes(1)
        expect(batchFn).toHaveBeenCalledWith([])
      })
    })
  })

  describe('lastResult bug investigation', () => {
    it('should preserve lastResult from execute() and not overwrite with item', async () => {
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          return `processed-${item}`
        },
        { started: false },
      )

      asyncQueuer.addItem('test1')
      asyncQueuer.start()

      await vi.advanceTimersByTimeAsync(100)

      expect(asyncQueuer.store.state.lastResult).toBe('processed-test1')
      expect(asyncQueuer.store.state.lastResult).not.toBe('test1')
    })
  })

  describe('getAbortSignal', () => {
    it('should be available as an instance method', () => {
      const asyncQueuer = new AsyncQueuer<string>(
        async (item) => {
          return item
        },
        { started: false },
      )

      expect(typeof asyncQueuer.getAbortSignal).toBe('function')
      expect(asyncQueuer.getAbortSignal()).toBeNull()
    })
  })
})
