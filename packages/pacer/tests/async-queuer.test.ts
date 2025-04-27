import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncQueuer } from '../src/async-queuer'

describe('AsyncQueuer', () => {
  let asyncQueuer: AsyncQueuer<any>

  beforeEach(() => {
    asyncQueuer = new AsyncQueuer()
  })

  describe('basic functionality', () => {
    it('should create an empty queue that is running and idle', () => {
      expect(asyncQueuer.getAllItems()).toHaveLength(0)
      expect(asyncQueuer.getIsIdle()).toBe(true)
      expect(asyncQueuer.getIsRunning()).toBe(true)
    })

    it('should create an empty queue that is not running and idle', () => {
      asyncQueuer = new AsyncQueuer({ started: false })
      expect(asyncQueuer.getAllItems()).toHaveLength(0)
      expect(asyncQueuer.getIsIdle()).toBe(false)
      expect(asyncQueuer.getIsRunning()).toBe(false)
    })

    it('should process tasks in FIFO order when started', async () => {
      const results: Array<number> = []
      const task1 = () => Promise.resolve(results.push(1))
      const task2 = () => Promise.resolve(results.push(2))
      const task3 = () => Promise.resolve(results.push(3))

      asyncQueuer.addItem(task1)
      asyncQueuer.addItem(task2)
      asyncQueuer.addItem(task3)

      await asyncQueuer.start()

      expect(results).toEqual([1, 2, 3])
      expect(asyncQueuer.getIsIdle()).toBe(true)
    })

    it('should respect concurrency limit', async () => {
      const running: Array<number> = []
      const maxConcurrent = { count: 0 }
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

      const createTask = (id: number) => async () => {
        running.push(id)
        maxConcurrent.count = Math.max(maxConcurrent.count, running.length)
        await delay(50)
        running.splice(running.indexOf(id), 1)
        return id
      }

      asyncQueuer = new AsyncQueuer({ concurrency: 2 })

      // Queue 5 tasks
      for (let i = 0; i < 5; i++) {
        asyncQueuer.addItem(createTask(i))
      }

      await asyncQueuer.start()

      expect(maxConcurrent.count).toBe(2) // Should never exceed 2 concurrent tasks
    })
  })

  describe('task management', () => {
    it('should handle task success properly', async () => {
      const successHandler = vi.fn()
      const result = 'success'

      asyncQueuer.onSuccess(successHandler)

      asyncQueuer.addItem(() => Promise.resolve(result))
      await asyncQueuer.start()

      expect(successHandler).toHaveBeenCalledWith(result)
    })

    it('should handle settled callback', async () => {
      const settledHandler = vi.fn()
      const result = 'test'

      asyncQueuer.onSettled(settledHandler)

      asyncQueuer.addItem(() => Promise.resolve(result))
      await asyncQueuer.start()

      expect(settledHandler).toHaveBeenCalled()
    })
  })

  describe('queue control', () => {
    it('should clear the queue', () => {
      asyncQueuer.stop()
      asyncQueuer.addItem(() => Promise.resolve(1))
      asyncQueuer.addItem(() => Promise.resolve(2))

      expect(asyncQueuer.getPendingItems()).toHaveLength(2)

      asyncQueuer.clear()

      expect(asyncQueuer.getPendingItems()).toHaveLength(0)
    })

    it('should throttle concurrency', async () => {
      asyncQueuer = new AsyncQueuer({ concurrency: 5 })
      const running: Array<number> = []
      const maxConcurrent = { count: 0 }
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

      const createTask = (id: number) => async () => {
        running.push(id)
        maxConcurrent.count = Math.max(maxConcurrent.count, running.length)
        await delay(50)
        running.splice(running.indexOf(id), 1)
        return id
      }

      // Queue 10 tasks
      for (let i = 0; i < 10; i++) {
        asyncQueuer.addItem(createTask(i))
      }

      asyncQueuer.start()
      await delay(10)
      asyncQueuer.setOptions({ concurrency: 2 })
      await asyncQueuer.start()

      expect(maxConcurrent.count).toBeLessThanOrEqual(5)
    })
  })

  describe('queue positions', () => {
    it('should support peeking at tasks', () => {
      asyncQueuer.stop()
      const task1 = () => Promise.resolve(1)
      const task2 = () => Promise.resolve(2)

      asyncQueuer.addItem(task1)
      asyncQueuer.addItem(task2)

      const frontTask = asyncQueuer.getPeek()
      const backTask = asyncQueuer.getPeek('back')

      // We can't compare the wrapped task functions directly
      // Instead verify the resolved values
      expect(frontTask?.()).resolves.toBe(1)
      expect(backTask?.()).resolves.toBe(2)
    })
  })

  describe('constructor options', () => {
    it('should respect started option', () => {
      const queue = new AsyncQueuer({ started: true })
      expect(queue.getIsRunning()).toBe(true)
    })

    it('should respect initial concurrency', async () => {
      const running: Array<number> = []
      const maxConcurrent = { count: 0 }
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))

      const createTask = (id: number) => async () => {
        running.push(id)
        maxConcurrent.count = Math.max(maxConcurrent.count, running.length)
        await delay(50)
        running.splice(running.indexOf(id), 1)
        return id
      }

      const queue = new AsyncQueuer({ concurrency: 3, started: true })

      // Queue 6 tasks
      for (let i = 0; i < 6; i++) {
        queue.addItem(createTask(i))
      }

      await queue.start()

      expect(maxConcurrent.count).toBe(3)
    })
  })
})
