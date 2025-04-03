import { Queue } from './queue'
import type { QueueOptions } from './queue'

export interface QueuerOptions<TValue> extends QueueOptions<TValue> {
  /**
   * Whether the queuer should start processing tasks immediately
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items
   */
  wait?: number
}

const defaultOptions: Required<QueuerOptions<any>> = {
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
  onGetNextItem: () => {},
  onUpdate: () => {},
  started: false,
  wait: 0,
}

/**
 * A synchronous queue processor that executes items one at a time in sequence.
 *
 * The Queuer extends the base Queue class to add processing capabilities. Items are processed
 * synchronously in order, with optional delays between processing each item.
 *
 * By default uses FIFO (First In First Out) behavior, but can be configured for LIFO
 * (Last In First Out) by specifying 'front' position when adding items.
 *
 * For asynchronous operations or concurrent processing, use AsyncQueuer instead.
 *
 * @example
 * ```ts
 * const queuer = new Queuer<number>();
 * queuer.onUpdate(num => console.log(num));
 * queuer.start();
 * queuer.addItem(1); // Logs: 1
 * queuer.addItem(2); // Logs: 2
 * ```
 */
export class Queuer<TValue> extends Queue<TValue> {
  protected options: Required<QueuerOptions<TValue>>
  private onUpdates: Array<(item: TValue) => void> = []
  private running: boolean
  private pendingTick = false

  constructor(initialOptions: QueuerOptions<TValue> = defaultOptions) {
    super(initialOptions)
    this.options = { ...defaultOptions, ...initialOptions }
    this.running = this.options.started
  }

  /**
   * Processes items in the queue
   */
  protected tick() {
    if (!this.running) {
      this.pendingTick = false
      return
    }
    while (!this.isEmpty()) {
      const nextItem = this.getNextItem()
      if (nextItem === undefined) {
        break
      }
      this.onUpdates.forEach((cb) => cb(nextItem))

      if (this.options.wait > 0) {
        // Use setTimeout to wait before processing next item
        setTimeout(() => this.tick(), this.options.wait)
        return
      }

      this.tick()
    }
    this.pendingTick = false
  }

  /**
   * Adds an item to the queue and starts processing if not already running
   * @returns true if item was added, false if queue is full
   */
  addItem(item: TValue, position?: 'front' | 'back'): boolean {
    const added = super.addItem(item, position)
    if (added && this.running && !this.pendingTick) {
      this.pendingTick = true
      this.tick()
    }
    this.options.onUpdate(this)
    return added
  }

  /**
   * Adds a callback to be called when an item is processed
   */
  onUpdate(cb: (item: TValue) => void) {
    this.onUpdates.push(cb)
    return () => {
      this.onUpdates = this.onUpdates.filter((d) => d !== cb)
    }
  }

  /**
   * Stops the queuer from processing items
   */
  stop() {
    this.running = false
    this.pendingTick = false
    this.options.onUpdate(this)
  }

  /**
   * Starts the queuer and processes items
   */
  start() {
    this.running = true
    if (!this.pendingTick && !this.isEmpty()) {
      this.pendingTick = true
      this.tick()
    }
    this.options.onUpdate(this)
  }

  reset(withInitialItems?: boolean) {
    super.reset(withInitialItems)
    this.running = this.options.started
  }

  /**
   * Returns true if the queuer is running
   */
  isRunning() {
    return this.running
  }

  /**
   * Returns true if the queuer is running but has no items to process
   */
  isIdle() {
    return this.running && this.isEmpty()
  }
}

/**
 * Creates a queuer that processes items in a queue immediately upon addition.
 * Items are processed sequentially in FIFO order by default.
 *
 * This is a simplified wrapper around the Queuer class that only exposes the
 * `addItem` method. For more control over queue processing, use the Queuer class
 * directly which provides methods like `start`, `stop`, `reset`, and more.
 *
 * @example
 * ```ts
 * // Basic sequential processing
 * const processItems = queuer<number>({
 *   wait: 1000,
 *   onUpdate: (queuer) => console.log(queuer.getAllItems())
 * })
 * processItems(1) // Logs: 1
 * processItems(2) // Logs: 2 after 1 completes
 *
 * // Priority queue
 * const processPriority = queuer<number>({
 *   process: async (n) => console.log(n),
 *   getPriority: n => n // Higher numbers processed first
 * })
 * processPriority(1)
 * processPriority(3) // Processed before 1
 * ```
 */
export function queue<TValue>(options: QueuerOptions<TValue> = {}) {
  const queue = new Queuer<TValue>({ ...options, started: true })
  return queue.addItem.bind(queue)
}
