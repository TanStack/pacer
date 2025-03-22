import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AsyncQueuer } from '../src/async-queuer'

describe('AsyncQueuer', () => {
  let queuer: AsyncQueuer<any>

  beforeEach(() => {
    queuer = new AsyncQueuer()
  })

  describe('basic functionality', () => {
    it('should create an empty queuer', () => {
      expect(queuer.getAllItems()).toHaveLength(0)
      expect(queuer.isIdle()).toBe(true)
      expect(queuer.isRunning()).toBe(false)
    })

    it('should process tasks in FIFO order when started', async () => {
      const results: Array<number> = []
      const task1 = () => Promise.resolve(results.push(1))
      const task2 = () => Promise.resolve(results.push(2))
      const task3 = () => Promise.resolve(results.push(3))

      queuer.addItem(task1)
      queuer.addItem(task2)
      queuer.addItem(task3)

      await queuer.start()

      expect(results).toEqual([1, 2, 3])
      expect(queuer.isIdle()).toBe(true)
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

      queuer = new AsyncQueuer({ concurrency: 2 })

      // Queue 5 tasks
      for (let i = 0; i < 5; i++) {
        queuer.addItem(createTask(i))
      }

      await queuer.start()

      expect(maxConcurrent.count).toBe(2) // Should never exceed 2 concurrent tasks
    })
  })

  describe('task management', () => {
    it('should handle task success properly', async () => {
      const successHandler = vi.fn()
      const result = 'success'

      queuer.onSuccess(successHandler)

      queuer.addItem(() => Promise.resolve(result))
      await queuer.start()

      expect(successHandler).toHaveBeenCalledWith(result, expect.any(Function))
    })

    it('should handle settled callback', async () => {
      const settledHandler = vi.fn()
      const result = 'test'

      queuer.onSettled(settledHandler)

      queuer.addItem(() => Promise.resolve(result))
      await queuer.start()

      expect(settledHandler).toHaveBeenCalled()
    })
  })

  describe('queue control', () => {
    it('should clear the queue', () => {
      queuer.addItem(() => Promise.resolve(1))
      queuer.addItem(() => Promise.resolve(2))

      expect(queuer.getPendingItems()).toHaveLength(2)

      queuer.clear()

      expect(queuer.getPendingItems()).toHaveLength(0)
      expect(queuer.isIdle()).toBe(true)
    })

    it('should throttle concurrency', async () => {
      queuer = new AsyncQueuer({ concurrency: 5 })
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
        queuer.addItem(createTask(i))
      }

      queuer.start()
      await delay(10)
      queuer.throttle(2) // Reduce concurrency to 2
      await queuer.start()

      expect(maxConcurrent.count).toBeLessThanOrEqual(5)
    })
  })

  describe('queue positions', () => {
    it('should support peeking at tasks', () => {
      const task1 = () => Promise.resolve(1)
      const task2 = () => Promise.resolve(2)

      queuer.addItem(task1)
      queuer.addItem(task2)

      const frontTask = queuer.peek()
      const backTask = queuer.peek('back')

      // We can't compare the wrapped task functions directly
      // Instead verify the resolved values
      expect(frontTask?.()).resolves.toBe(1)
      expect(backTask?.()).resolves.toBe(2)
    })
  })

  describe('constructor options', () => {
    it('should respect started option', () => {
      const queuer = new AsyncQueuer({ started: true })
      expect(queuer.isRunning()).toBe(true)
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

      const queuer = new AsyncQueuer({ concurrency: 3, started: true })

      // Queue 6 tasks
      for (let i = 0; i < 6; i++) {
        queuer.addItem(createTask(i))
      }

      await queuer.start()

      expect(maxConcurrent.count).toBe(3)
    })
  })
})
