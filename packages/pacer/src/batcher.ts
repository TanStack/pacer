import type { OptionalKeys } from './types'

export interface BatcherState<TValue> {
  batchExecutionCount: number
  itemExecutionCount: number
  items: Array<TValue>
  running: boolean
}

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
   * Initial state for the batcher
   */
  initialState?: Partial<BatcherState<TValue>>
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
   * Callback function that is called when the state of the batcher is updated
   */
  onStateChange?: (
    state: BatcherState<TValue>,
    batcher: Batcher<TValue>,
  ) => void
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
  | 'initialState'
  | 'onExecute'
  | 'onItemsChange'
  | 'onIsRunningChange'
  | 'onStateChange'
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
 * State Management:
 * - Use `initialState` to provide initial state values when creating the batcher
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes batch execution count, item execution count, items, and running status
 * - State can be retrieved using `getState()` method
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
  #options: BatcherOptionsWithOptionalCallbacks<TValue>
  #state: BatcherState<TValue> = {
    batchExecutionCount: 0,
    itemExecutionCount: 0,
    items: [],
    running: true,
  }
  #timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: (items: Array<TValue>) => void,
    initialOptions: BatcherOptions<TValue>,
  ) {
    this.#options = { ...defaultOptions, ...initialOptions }
    this.#state = {
      ...this.#state,
      ...this.#options.initialState,
    }
  }

  /**
   * Updates the batcher options
   */
  setOptions(newOptions: Partial<BatcherOptions<TValue>>): void {
    this.#options = { ...this.#options, ...newOptions }
  }

  /**
   * Returns the current batcher options
   */
  getOptions(): BatcherOptions<TValue> {
    return this.#options
  }

  getState(): BatcherState<TValue> {
    return { ...this.#state }
  }

  #setState(newState: Partial<BatcherState<TValue>>): void {
    this.#state = { ...this.#state, ...newState }
    this.#options.onStateChange?.(this.#state, this)
  }

  /**
   * Adds an item to the batcher
   * If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed
   */
  addItem(item: TValue): void {
    this.#setState({
      items: [...this.#state.items, item],
    })
    this.#options.onItemsChange?.(this)

    const shouldProcess =
      this.#state.items.length >= this.#options.maxSize ||
      this.#options.getShouldExecute(this.#state.items, this)

    if (shouldProcess) {
      this.execute()
    } else if (
      this.#state.running &&
      !this.#timeoutId &&
      this.#options.wait !== Infinity
    ) {
      this.#timeoutId = setTimeout(() => this.execute(), this.#options.wait)
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
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }

    if (this.#state.items.length === 0) {
      return
    }

    const batch = this.peekAllItems() // copy of the items to be processed (to prevent race conditions)
    this.#setState({ items: [] }) // Clear items before processing to prevent race conditions
    this.#options.onItemsChange?.(this) // Call onItemsChange to notify listeners that the items have changed

    this.fn(batch)
    this.#setState({
      batchExecutionCount: this.#state.batchExecutionCount + 1,
      itemExecutionCount: this.#state.itemExecutionCount + batch.length,
    })
    this.#options.onExecute?.(this)
  }

  /**
   * Stops the batcher from processing batches
   */
  stop(): void {
    this.#setState({ running: false })
    this.#options.onIsRunningChange?.(this)
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
  }

  /**
   * Starts the batcher and processes any pending items
   */
  start(): void {
    this.#setState({ running: true })
    this.#options.onIsRunningChange?.(this)
    if (this.#state.items.length > 0 && !this.#timeoutId) {
      this.#timeoutId = setTimeout(() => this.execute(), this.#options.wait)
    }
  }

  /**
   * Returns the current number of items in the batcher
   */
  getSize(): number {
    return this.#state.items.length
  }

  /**
   * Returns true if the batcher is empty
   */
  getIsEmpty(): boolean {
    return this.#state.items.length === 0
  }

  /**
   * Returns true if the batcher is running
   */
  getIsRunning(): boolean {
    return this.#state.running
  }

  /**
   * Returns a copy of all items in the batcher
   */
  peekAllItems(): Array<TValue> {
    return [...this.#state.items]
  }

  /**
   * Returns the number of batches that have been processed
   */
  getBatchExecutionCount(): number {
    return this.#state.batchExecutionCount
  }

  /**
   * Returns the total number of items that have been processed
   */
  getItemExecutionCount(): number {
    return this.#state.itemExecutionCount
  }
}

/**
 * Creates a batcher that processes items in batches
 *
 * @example
 * ```ts
 * const batchItems = batch<number>({
 *   batchSize: 3,
 *   processBatch: (items) => console.log('Processing:', items)
 * });
 *
 * batchItems(1);
 * batchItems(2);
 * batchItems(3); // Triggers batch processing
 * ```
 */
export function batch<TValue>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue>,
) {
  const batcher = new Batcher<TValue>(fn, options)
  return batcher.addItem.bind(batcher)
}
