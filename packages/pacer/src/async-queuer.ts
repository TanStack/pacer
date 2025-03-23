import { Queuer } from './queuer'
import type { QueuerOptions } from './queuer'

export interface AsyncQueuerOptions<TValue>
  extends QueuerOptions<() => Promise<TValue>> {
  /**
   * Maximum number of concurrent items that can run at once
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
 * A flexible async queuer that processes asynchronous tasks with configurable concurrency control.
 *
 * Features:
 * - Priority queue support via getPriority option
 * - Configurable concurrency limit
 * - Task success/error/completion callbacks
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume task processing
 * - Task cancellation
 *
 * Tasks are processed concurrently up to the configured concurrency limit. When a task completes,
 * the next pending task is processed if below the concurrency limit.
 *
 * The queue can be used in FIFO mode (default) where tasks are processed in order of addition,
 * or LIFO mode where the most recently added tasks are processed first.
 *
 * @example
 * ```ts
 * const queuer = new AsyncQueuer<string>({ concurrency: 2 });
 *
 * // Add tasks to the queue
 * queuer.addItem(async () => {
 *   const result = await someAsyncOperation();
 *   return result;
 * });
 *
 * // Start processing
 * queuer.start();
 *
 * // Listen for task completion
 * queuer.onSuccess((result) => {
 *   console.log('Task completed:', result);
 * });
 * ```
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

  /**
   * Processes the next item in the queue
   * @returns A promise that resolves when the item is processed
   */
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
   * Throttles the number of concurrent items that can run at once
   */
  throttle(n: number) {
    this.currentConcurrency = n
  }

  /**
   * Adds a callback to be called when a task is settled
   */
  onSettled(cb: () => void) {
    this.onSettles.push(cb)
    return () => {
      this.onSettles = this.onSettles.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task errors
   */
  onError(cb: (error: any, task: () => Promise<any>) => void) {
    this.onErrors.push(cb)
    return () => {
      this.onErrors = this.onErrors.filter((d) => d !== cb)
    }
  }

  /**
   * Adds a callback to be called when a task succeeds
   */
  onSuccess(cb: (result: any, task: () => Promise<any>) => void) {
    this.onSuccesses.push(cb)
    return () => {
      this.onSuccesses = this.onSuccesses.filter((d) => d !== cb)
    }
  }

  /**
   * Starts the queuer and processes items
   * @returns A promise that resolves when the queuer is settled
   */
  start() {
    super.start()
    return new Promise<void>((resolve) => {
      this.onSettled(() => {
        if (this.isIdle()) {
          resolve()
        }
      })
    })
  }

  /**
   * Returns the active items
   * @returns The active items
   */
  getActiveItems() {
    return this.active
  }

  /**
   * Returns the pending items
   * @returns The pending items
   */
  getPendingItems() {
    return super.getAllItems()
  }

  /**
   * Returns all items (active and pending)
   * @returns All items
   */
  getAllItems() {
    return [...this.active, ...this.getPendingItems()]
  }

  /**
   * Returns true if all items are settled
   */
  isIdle() {
    return !this.active.length && this.isEmpty()
  }
}
