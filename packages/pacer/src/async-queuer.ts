import { Queuer } from './queuer'
import type { QueuerOptions } from './queuer'

export interface AsyncQueuerOptions<TValue>
  extends QueuerOptions<() => Promise<TValue>> {
  /**
   * Maximum number of concurrent tasks that can run at once
   * @default 2
   */
  concurrency?: number
}

const defaultOptions: Required<AsyncQueuerOptions<any>> = {
  concurrency: 2,
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
  onUpdate: () => {},
  started: false,
  wait: 0,
}

/**
 * A flexible async queuer that supports priority tasks, concurrency control, and task callbacks.
 *
 * Can be used as a FIFO or LIFO queue by specifying the position of the task.
 *
 * Also known as a task pool or task queue
 * @template TValue The type of the task result
 */
export class AsyncQueuer<TValue> extends Queuer<() => Promise<TValue>> {
  protected options: Required<AsyncQueuerOptions<TValue>> = defaultOptions
  private onSettles: Array<(res: any, error: any) => void> = []
  private onErrors: Array<(error: any, task: () => Promise<any>) => void> = []
  private onSuccesses: Array<(result: any, task: () => Promise<any>) => void> =
    []
  private active: Array<() => Promise<any>> = []
  private currentConcurrency: number

  constructor({
    initialItems,
    ...options
  }: AsyncQueuerOptions<TValue> = defaultOptions) {
    super(options)
    this.options = { ...defaultOptions, ...options }
    for (const item of initialItems ?? []) {
      this.addItem(item)
    }
    this.currentConcurrency = this.options.concurrency
  }

  protected tick() {
    if (!this.isRunning()) {
      return
    }
    while (this.active.length < this.currentConcurrency && !this.isEmpty()) {
      const nextFn = this.getNextItem()
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
        } finally {
          this.options.onUpdate(this as any)
        }
        this.active = this.active.filter((d) => d !== nextFn)
        if (success) {
          this.onSuccesses.forEach((d) => d(res, nextFn))
        } else {
          this.onErrors.forEach((d) => d(error, nextFn))
        }
        this.onSettles.forEach((d) => d(res, error))

        if (this.options.wait > 0) {
          // Use setTimeout to wait before processing next item
          setTimeout(() => {
            this.tick()
          }, this.options.wait)
          return
        }

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
  // @ts-ignore - This is a workaround to allow the addItem method to return a promise
  addItem(
    fn: () => Promise<TValue> | TValue,
    position?: 'front' | 'back',
  ): Promise<TValue> {
    this.options.onUpdate(this as any)
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

      super.addItem(task, position)
      this.tick()
    })
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
   * Starts the queuer and processes tasks
   * @returns A promise that resolves when the queuer is settled
   */
  start() {
    super.start()
    return new Promise<void>((resolve) => {
      this.onSettled(() => {
        if (this.isSettled()) {
          resolve()
        }
      })
    })
  }

  /**
   * Returns the active tasks
   * @returns The active tasks
   */
  getActiveItems() {
    return this.active
  }

  /**
   * Returns the pending tasks
   * @returns The pending tasks
   */
  getPendingItems() {
    return super.getAllItems()
  }

  /**
   * Returns all tasks
   * @returns All tasks
   */
  getAllItems() {
    return [...this.active, ...this.getPendingItems()]
  }

  /**
   * Returns true if all tasks are settled
   */
  isSettled() {
    return !this.active.length && this.isEmpty()
  }
}
