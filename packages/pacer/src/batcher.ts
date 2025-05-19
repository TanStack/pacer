import type { OptionalKeys } from './types'

/**
 * Options for configuring a Batcher instance
 */
export interface BatcherOptions<TValue> {
  /**
   * Custom function to determine if a batch should be processed
   * Return true to process the batch immediately
   */
  getShouldExecute?: (items: Array<TValue>, batcher: Batcher<TValue>) => boolean
  /**
   * Maximum number of items in a batch
   * @default Infinity
   */
  maxSize?: number
  /**
   * Callback fired after a batch is processed
   */
  onExecute?: (batcher: Batcher<TValue>) => void
  /**
   * Callback fired when the batcher's running state changes
   */
  onIsRunningChange?: (batcher: Batcher<TValue>) => void
  /**
   * Callback fired after items are added to the batcher
   */
  onItemsChange?: (batcher: Batcher<TValue>) => void
  /**
   * Whether the batcher should start processing immediately
   * @default true
   */
  started?: boolean
  /**
   * Maximum time in milliseconds to wait before processing a batch.
   * If the wait duration has elapsed, the batch will be processed.
   * If not provided, the batch will not be triggered by a timeout.
   * @default Infinity
   */
  wait?: number
}

type BatcherOptionsWithOptionalCallbacks<TValue> = OptionalKeys<
  Required<BatcherOptions<TValue>>,
  'onExecute' | 'onItemsChange' | 'onIsRunningChange'
>

const defaultOptions: BatcherOptionsWithOptionalCallbacks<any> = {
  getShouldExecute: () => false,
  maxSize: Infinity,
  started: true,
  wait: Infinity,
}

/**
 * A class that collects items and processes them in batches.
 *
 * Batching is a technique for grouping multiple operations together to be processed as a single unit.
 *
 * The Batcher provides a flexible way to implement batching with configurable:
 * - Maximum batch size (number of items per batch)
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 * - Event callbacks for monitoring batch operations
 *
 * @example
 * ```ts
 * const batcher = new Batcher<number>(
 *   (items) => console.log('Processing batch:', items),
 *   {
 *     maxSize: 5,
 *     wait: 2000,
 *     onExecuteBatch: (items) => console.log('Batch executed:', items)
 *   }
 * );
 *
 * batcher.addItem(1);
 * batcher.addItem(2);
 * // After 2 seconds or when 5 items are added, whichever comes first,
 * // the batch will be processed
 * // batcher.execute() // manually trigger a batch
 * ```
 */
export class Batcher<TValue> {
  private _options: BatcherOptionsWithOptionalCallbacks<TValue>
  private _batchExecutionCount = 0
  private _itemExecutionCount = 0
  private _items: Array<TValue> = []
  private _running: boolean
  private _timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: (items: Array<TValue>) => void,
    initialOptions: BatcherOptions<TValue>,
  ) {
    this._options = { ...defaultOptions, ...initialOptions }
    this._running = this._options.started
  }

  /**
   * Updates the batcher options
   */
  setOptions(newOptions: Partial<BatcherOptions<TValue>>): void {
    this._options = { ...this._options, ...newOptions }
  }

  /**
   * Returns the current batcher options
   */
  getOptions(): BatcherOptions<TValue> {
    return this._options
  }

  /**
   * Adds an item to the batcher
   * If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed
   */
  addItem(item: TValue): void {
    this._items.push(item)
    this._options.onItemsChange?.(this)

    const shouldProcess =
      this._items.length >= this._options.maxSize ||
      this._options.getShouldExecute(this._items, this)

    if (shouldProcess) {
      this.execute()
    } else if (
      this._running &&
      !this._timeoutId &&
      this._options.wait !== Infinity
    ) {
      this._timeoutId = setTimeout(() => this.execute(), this._options.wait)
    }
  }

  /**
   * Processes the current batch of items.
   * This method will automatically be triggered if the batcher is running and any of these conditions are met:
   * - The number of items reaches batchSize
   * - The wait duration has elapsed
   * - The getShouldExecute function returns true upon adding an item
   *
   * You can also call this method manually to process the current batch at any time.
   */
  execute(): void {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }

    if (this._items.length === 0) {
      return
    }

    const batch = this.getAllItems() // copy of the items to be processed (to prevent race conditions)
    this._items = [] // Clear items before processing to prevent race conditions
    this._options.onItemsChange?.(this) // Call onItemsChange to notify listeners that the items have changed

    this.fn(batch)
    this._batchExecutionCount++
    this._itemExecutionCount += batch.length
    this._options.onExecute?.(this)
  }

  /**
   * Stops the batcher from processing batches
   */
  stop(): void {
    this._running = false
    this._options.onIsRunningChange?.(this)
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = null
    }
  }

  /**
   * Starts the batcher and processes any pending items
   */
  start(): void {
    this._running = true
    this._options.onIsRunningChange?.(this)
    if (this._items.length > 0 && !this._timeoutId) {
      this._timeoutId = setTimeout(() => this.execute(), this._options.wait)
    }
  }

  /**
   * Returns the current number of items in the batcher
   */
  getSize(): number {
    return this._items.length
  }

  /**
   * Returns true if the batcher is empty
   */
  getIsEmpty(): boolean {
    return this._items.length === 0
  }

  /**
   * Returns true if the batcher is running
   */
  getIsRunning(): boolean {
    return this._running
  }

  /**
   * Returns a copy of all items currently in the batcher
   */
  getAllItems(): Array<TValue> {
    return [...this._items]
  }

  /**
   * Returns the number of times batches have been processed
   */
  getBatchExecutionCount(): number {
    return this._batchExecutionCount
  }

  /**
   * Returns the total number of individual items that have been processed
   */
  getItemExecutionCount(): number {
    return this._itemExecutionCount
  }
}

/**
 * Creates a batcher that processes items in batches
 *
 * @example
 * ```ts
 * const batchItems = batcher<number>({
 *   batchSize: 3,
 *   processBatch: (items) => console.log('Processing:', items)
 * });
 *
 * batchItems(1);
 * batchItems(2);
 * batchItems(3); // Triggers batch processing
 * ```
 */
export function batcher<TValue>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue>,
) {
  const batcher = new Batcher<TValue>(fn, options)
  return batcher.addItem.bind(batcher)
}
