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
 * A simpler synchronous queuer that processes items synchronously without async/concurrency features
 * Can be used as a FIFO or LIFO queue by specifying the position of the item
 * Not recommended for use with async operations that require concurrency
 * @template TValue The type of the item
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
   * @param item The item to add
   * @param position The position to add the item to (defaults to back for FIFO behavior)
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
   * @param cb The callback to add
   * @returns A function to remove the callback
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
