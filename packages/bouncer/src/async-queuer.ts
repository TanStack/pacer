import { Queue } from './queue'
import type { QueueOptions } from './queue'

export interface AsyncQueuerOptions<TValue>
  extends QueueOptions<() => Promise<TValue>> {
  /**
   * Maximum number of concurrent tasks that can run at once
   * @default 5
   */
  concurrency?: number
  /**
   * Whether the queuer should start processing tasks immediately
   * @default false
   */
  started?: boolean
}

const defaultOptions: Required<AsyncQueuerOptions<any>> = {
  concurrency: 5,
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
  onUpdate: () => {},
  started: false,
}

/**
 * A flexible async queuer that supports priority tasks, concurrency control, and task callbacks
 * Can be used as a FIFO or LIFO queue by specifying the position of the task
 * Also known as a task pool or task queue
 * @template TValue The type of the task result
 */
export class AsyncQueuer<TValue> {
  private onSettles: Array<(res: any, error: any) => void> = []
  private onErrors: Array<(error: any, task: () => Promise<any>) => void> = []
  private onSuccesses: Array<(result: any, task: () => Promise<any>) => void> =
    []
  private running: boolean
  private active: Array<() => Promise<any>> = []
  private queue: Queue<() => Promise<any>>
  private currentConcurrency: number

  constructor(options: AsyncQueuerOptions<TValue> = defaultOptions) {
    const { concurrency, started, ...queueOptions } = {
      ...defaultOptions,
      ...options,
    }
    this.currentConcurrency = concurrency
    this.queue = new Queue(queueOptions)
    this.running = started
  }

  private tick() {
    if (!this.running) {
      return
    }
    while (
      this.active.length < this.currentConcurrency &&
      !this.queue.isEmpty()
    ) {
      const nextFn = this.queue.dequeue()
      if (!nextFn) {
        throw new Error('Found task that is not a function')
      }
      this.active.push(nextFn)
      ;(async () => {
        let success = false
        let res!: TValue
        let error: any
        try {
          res = await nextFn()
          success = true
        } catch (e) {
          error = e
        }
        this.active = this.active.filter((d) => d !== nextFn)
        if (success) {
          this.onSuccesses.forEach((d) => d(res, nextFn))
        } else {
          this.onErrors.forEach((d) => d(error, nextFn))
        }
        this.onSettles.forEach((d) => d(res, error))
        this.tick()
      })()
    }
  }

  /**
   * Adds a task to the queue
   * @param fn The task to add
   * @param position The position to add the task to (defaults to back for FIFO behavior)
   * @returns A promise that resolves when the task is settled
   */
  enqueue(fn: () => Promise<TValue> | TValue, position?: 'front' | 'back') {
    return new Promise<any>((resolve, reject) => {
      const task = () =>
        Promise.resolve(fn())
          .then((res) => {
            resolve(res)
            return res
          })
          .catch((err) => {
            reject(err)
            throw err
          })

      // Use specified position or default to 'back' for FIFO behavior
      this.queue.enqueue(task, position)
      this.tick()
    })
  }

  /**
   * Returns the next task in the queue without removing it
   * @param position The position to peek at (defaults to front for FIFO behavior)
   * @returns The next task or undefined if the queue is empty
   */
  peek(position?: 'front' | 'back') {
    return this.queue.peek(position)
  }

  /**
   * Throttles the number of concurrent tasks that can run at once
   * @param n The new concurrency limit
   */
  throttle(n: number) {
    this.currentConcurrency = n
  }

  /**
   * Adds a callback to be called when a task is settled
   * @param cb The callback to add
   * @returns A function to remove the callback
   */
  onSettled(cb: () => void) {
    this.onSettles.push(cb)
    return () => {
      this.onSettles = this.onSettles.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task errors
   * @param cb The callback to add
   * @returns A function to remove the callback
   */
  onError(cb: (error: any, task: () => Promise<any>) => void) {
    this.onErrors.push(cb)
    return () => {
      this.onErrors = this.onErrors.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task succeeds
   * @param cb The callback to add
   * @returns A function to remove the callback
   */
  onSuccess(cb: (result: any, task: () => Promise<any>) => void) {
    this.onSuccesses.push(cb)
    return () => {
      this.onSuccesses = this.onSuccesses.filter((d) => d !== cb)
    }
  }

  /**
   * Stops the queuer from processing tasks
   */
  stop() {
    this.running = false
  }

  /**
   * Starts the queuer and processes tasks
   * @returns A promise that resolves when the queuer is settled
   */
  start() {
    this.running = true
    this.tick()
    return new Promise<void>((resolve) => {
      this.onSettled(() => {
        if (this.isSettled()) {
          resolve()
        }
      })
    })
  }

  /**
   * Clears the queue
   */
  clear() {
    this.queue.clear()
  }

  /**
   * Returns the active tasks
   * @returns The active tasks
   */
  getActive() {
    return this.active
  }

  /**
   * Returns the pending tasks
   * @returns The pending tasks
   */
  getPending() {
    return this.queue.getItems()
  }

  /**
   * Returns all tasks
   * @returns All tasks
   */
  getAll() {
    return [...this.active, ...this.getPending()]
  }

  isRunning() {
    return this.running
  }

  isSettled() {
    return !this.active.length && this.queue.isEmpty()
  }
}
