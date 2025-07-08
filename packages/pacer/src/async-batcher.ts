import { Store } from '@tanstack/store'
import type { OptionalKeys } from './types'

export interface AsyncBatcherState<TValue> {
  errorCount: number
  isEmpty: boolean
  isExecuting: boolean
  isPending: boolean
  isRunning: boolean
  totalItemsProcessed: number
  items: Array<TValue>
  lastResult: any
  settleCount: number
  size: number
  status: 'idle' | 'pending'
  successCount: number
}

function getDefaultAsyncBatcherState<TValue>(): AsyncBatcherState<TValue> {
  return {
    errorCount: 0,
    isEmpty: true,
    isExecuting: false,
    isPending: false,
    isRunning: true,
    totalItemsProcessed: 0,
    items: [],
    lastResult: undefined,
    settleCount: 0,
    size: 0,
    status: 'idle',
    successCount: 0,
  }
}

/**
 * Options for configuring an AsyncBatcher instance
 */
export interface AsyncBatcherOptions<TValue> {
  /**
   * Custom function to determine if a batch should be processed
   * Return true to process the batch immediately
   */
  getShouldExecute?: (
    items: Array<TValue>,
    batcher: AsyncBatcher<TValue>,
  ) => boolean
  /**
   * Initial state for the async batcher
   */
  initialState?: Partial<AsyncBatcherState<TValue>>
  /**
   * Maximum number of items in a batch
   * @default Infinity
   */
  maxSize?: number
  /**
   * Optional error handler for when the batch function throws.
   * If provided, the handler will be called with the error and batcher instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (error: unknown, batcher: AsyncBatcher<TValue>) => void
  /**
   * Callback fired after a batch is processed
   */
  onExecute?: (batcher: AsyncBatcher<TValue>) => void
  /**
   * Callback fired after items are added to the batcher
   */
  onItemsChange?: (batcher: AsyncBatcher<TValue>) => void
  /**
   * Optional callback to call when a batch is settled (completed or failed)
   */
  onSettled?: (batcher: AsyncBatcher<TValue>) => void
  /**
   * Optional callback to call when a batch succeeds
   */
  onSuccess?: (result: any, batcher: AsyncBatcher<TValue>) => void
  /**
   * Whether the batcher should start processing immediately
   * @default true
   */
  started?: boolean
  /**
   * Whether to throw errors when they occur.
   * Defaults to true if no onError handler is provided, false if an onError handler is provided.
   * Can be explicitly set to override these defaults.
   */
  throwOnError?: boolean
  /**
   * Maximum time in milliseconds to wait before processing a batch.
   * If the wait duration has elapsed, the batch will be processed.
   * If not provided, the batch will not be triggered by a timeout.
   * @default Infinity
   */
  wait?: number
}

type AsyncBatcherOptionsWithOptionalCallbacks<TValue> = OptionalKeys<
  Required<AsyncBatcherOptions<TValue>>,
  | 'initialState'
  | 'onError'
  | 'onExecute'
  | 'onItemsChange'
  | 'onSettled'
  | 'onSuccess'
>

const defaultOptions: AsyncBatcherOptionsWithOptionalCallbacks<any> = {
  getShouldExecute: () => false,
  maxSize: Infinity,
  started: true,
  throwOnError: true,
  wait: Infinity,
}

/**
 * A class that collects items and processes them in batches asynchronously.
 *
 * This is the async version of the Batcher class. Unlike the sync version, this async batcher:
 * - Handles promises and returns results from batch executions
 * - Provides error handling with configurable error behavior
 * - Tracks success, error, and settle counts separately
 * - Has state tracking for when batches are executing
 * - Returns the result of the batch function execution
 *
 * Batching is a technique for grouping multiple operations together to be processed as a single unit.
 *
 * The AsyncBatcher provides a flexible way to implement async batching with configurable:
 * - Maximum batch size (number of items per batch)
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 * - Event callbacks for monitoring batch operations
 * - Error handling for failed batch operations
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the AsyncBatcher instance
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async batcher
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes total items processed, success/error counts, and execution status
 * - State can be retrieved using `getState()` method
 *
 * @example
 * ```ts
 * const batcher = new AsyncBatcher<number>(
 *   async (items) => {
 *     const result = await processItems(items);
 *     console.log('Processing batch:', items);
 *     return result;
 *   },
 *   {
 *     maxSize: 5,
 *     wait: 2000,
 *     onSuccess: (result) => console.log('Batch succeeded:', result),
 *     onError: (error) => console.error('Batch failed:', error)
 *   }
 * );
 *
 * batcher.addItem(1);
 * batcher.addItem(2);
 * // After 2 seconds or when 5 items are added, whichever comes first,
 * // the batch will be processed and the result will be available
 * // batcher.execute() // manually trigger a batch
 * ```
 */
export class AsyncBatcher<TValue> {
  readonly store: Store<AsyncBatcherState<TValue>> = new Store(
    getDefaultAsyncBatcherState<TValue>(),
  )
  #options: AsyncBatcherOptionsWithOptionalCallbacks<TValue>
  #timeoutId: NodeJS.Timeout | null = null

  constructor(
    private fn: (items: Array<TValue>) => Promise<any>,
    initialOptions: AsyncBatcherOptions<TValue>,
  ) {
    this.#options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.#options.initialState ?? {})
  }

  /**
   * Updates the async batcher options
   */
  setOptions = (newOptions: Partial<AsyncBatcherOptions<TValue>>): void => {
    this.#options = { ...this.#options, ...newOptions }
  }

  #setState = (newState: Partial<AsyncBatcherState<TValue>>): void => {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }
      const { isPending, items } = combinedState
      const size = items.length
      const isEmpty = size === 0
      return {
        ...combinedState,
        isEmpty,
        size,
        status: isPending ? 'pending' : 'idle',
      }
    })
  }

  /**
   * Adds an item to the async batcher
   * If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed
   */
  addItem = (item: TValue): void => {
    this.#setState({
      items: [...this.store.state.items, item],
      isPending: this.#options.wait !== Infinity,
    })
    this.#options.onItemsChange?.(this)

    const shouldProcess =
      this.store.state.items.length >= this.#options.maxSize ||
      this.#options.getShouldExecute(this.store.state.items, this)

    if (shouldProcess) {
      this.execute()
    } else if (
      this.store.state.isRunning &&
      !this.#timeoutId &&
      this.#options.wait !== Infinity
    ) {
      this.#timeoutId = setTimeout(() => this.execute(), this.#options.wait)
    }
  }

  /**
   * Processes the current batch of items asynchronously.
   * This method will automatically be triggered if the batcher is running and any of these conditions are met:
   * - The number of items reaches maxSize
   * - The wait duration has elapsed
   * - The getShouldExecute function returns true upon adding an item
   *
   * You can also call this method manually to process the current batch at any time.
   *
   * @returns A promise that resolves with the result of the batch function, or undefined if an error occurred and was handled by onError
   * @throws The error from the batch function if no onError handler is configured
   */
  execute = async (): Promise<any> => {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }

    if (this.store.state.items.length === 0) {
      return undefined
    }

    const batch = this.peekAllItems() // copy of the items to be processed (to prevent race conditions)
    this.clear() // Clear items before processing to prevent race conditions
    this.#options.onItemsChange?.(this) // Call onItemsChange to notify listeners that the items have changed

    this.#setState({ isExecuting: true })

    try {
      const result = await this.fn(batch) // EXECUTE
      this.#setState({
        totalItemsProcessed:
          this.store.state.totalItemsProcessed + batch.length,
        lastResult: result,
        successCount: this.store.state.successCount + 1,
      })
      this.#options.onSuccess?.(result, this)
      return result
    } catch (error) {
      this.#setState({
        errorCount: this.store.state.errorCount + 1,
      })
      this.#options.onError?.(error, this)
      if (this.#options.throwOnError) {
        throw error
      }
      return undefined
    } finally {
      this.#setState({
        isExecuting: false,
        settleCount: this.store.state.settleCount + 1,
      })
      this.#options.onSettled?.(this)
      this.#options.onExecute?.(this)
    }
  }

  /**
   * Stops the async batcher from processing batches
   */
  stop = (): void => {
    this.#setState({ isRunning: false })
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
  }

  /**
   * Starts the async batcher and processes any pending items
   */
  start = (): void => {
    this.#setState({ isRunning: true })
    if (this.store.state.items.length > 0 && !this.#timeoutId) {
      this.#timeoutId = setTimeout(() => this.execute(), this.#options.wait)
    }
  }

  /**
   * Returns a copy of all items in the async batcher
   */
  peekAllItems = (): Array<TValue> => {
    return [...this.store.state.items]
  }

  /**
   * Removes all items from the async batcher
   */
  clear = (): void => {
    this.#setState({ items: [], isPending: false })
  }

  /**
   * Resets the async batcher state to its default values
   */
  reset = (): void => {
    this.#setState(getDefaultAsyncBatcherState<TValue>())
  }
}

/**
 * Creates an async batcher that processes items in batches
 *
 * Unlike the sync batcher, this async version:
 * - Handles promises and returns results from batch executions
 * - Provides error handling with configurable error behavior
 * - Tracks success, error, and settle counts separately
 * - Has state tracking for when batches are executing
 *
 * Error Handling:
 * - If an `onError` handler is provided, it will be called with the error and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncBatcher instance
 *
 * State Management:
 * - Use `initialState` to provide initial state values when creating the async batcher
 * - Use `onStateChange` callback to react to state changes and implement custom persistence
 * - The state includes total items processed, success/error counts, and execution status
 *
 * @example
 * ```ts
 * const batchItems = asyncBatch<number>(
 *   async (items) => {
 *     const result = await processApiCall(items);
 *     console.log('Processing:', items);
 *     return result;
 *   },
 *   {
 *     maxSize: 3,
 *     wait: 1000,
 *     onSuccess: (result) => console.log('Batch succeeded:', result),
 *     onError: (error) => console.error('Batch failed:', error)
 *   }
 * );
 *
 * batchItems(1);
 * batchItems(2);
 * batchItems(3); // Triggers batch processing
 * ```
 */
export function asyncBatch<TValue>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue>,
) {
  const batcher = new AsyncBatcher<TValue>(fn, options)
  return batcher.addItem
}
