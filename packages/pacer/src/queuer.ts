import { Queue } from './queue'
import type { QueueOptions } from './queue'

export interface QueuerOptions<TValue> extends QueueOptions<TValue> {
  /**
   * Whether the queuer should start processing tasks immediately
   * @default false
   */
  started?: boolean
  /**
   * Time in milliseconds to wait between processing items
   * @default 0
   */
  wait?: number
}

const defaultOptions: Required<QueuerOptions<any>> = {
  getPriority: () => 0,
  initialItems: [],
  maxSize: Infinity,
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
  protected options: Required<QueuerOptions<TValue>> = defaultOptions
  private onUpdates: Array<(item: TValue) => void> = []
  private running: boolean
  private pendingTick = false

  constructor(options: QueuerOptions<TValue> = defaultOptions) {
    super(options)
    this.options = { ...defaultOptions, ...options }
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
