import { Queue } from './data-structures/queue'
import { RateLimiter } from './rate-limiter'
import type { QueueOptions } from './data-structures/queue'
import type { RateLimiterOptions } from './rate-limiter'

export interface RateLimitedQueueOptions<TValue>
  extends QueueOptions<TValue>,
    RateLimiterOptions {}

/**
 * A queue that processes items at a controlled rate
 */
export class RateLimitedQueue<TValue> {
  private queue: Queue<TValue>
  private rateLimiter: RateLimiter<(item: TValue) => void, [TValue]>
  private processingInterval: NodeJS.Timeout | undefined
  private isProcessing = false

  constructor(
    private processor: (item: TValue) => void,
    options: RateLimitedQueueOptions<TValue>,
  ) {
    this.queue = new Queue<TValue>(options)
    this.rateLimiter = new RateLimiter(
      (item: TValue) => this.processor(item),
      options,
    )
  }

  /**
   * Adds an item to the queue
   * @returns boolean indicating if the item was successfully added
   */
  enqueue(item: TValue): boolean {
    const result = this.queue.enqueue(item)
    this.startProcessing()
    return result
  }

  /**
   * Returns the number of items currently in the queue
   */
  size(): number {
    return this.queue.size()
  }

  /**
   * Starts processing items in the queue if not already processing
   */
  private startProcessing(): void {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processingInterval = setInterval(() => {
      this.processNextItem()
    }, 100) // Check queue every 100ms
  }

  /**
   * Attempts to process the next item in the queue
   */
  private processNextItem(): void {
    if (this.queue.isEmpty()) {
      this.stopProcessing()
      return
    }

    const item = this.queue.peek()
    if (item !== undefined && this.rateLimiter.maybeExecute(item)) {
      this.queue.dequeue() // Only remove item if it was successfully processed
    }
  }

  /**
   * Stops the processing loop
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
    }
    this.isProcessing = false
  }

  /**
   * Clears the queue and stops processing
   */
  clear(): void {
    this.stopProcessing()
    this.queue.clear()
    this.rateLimiter.reset()
  }

  /**
   * Stops processing and cleans up resources
   */
  destroy(): void {
    this.clear()
  }
}
