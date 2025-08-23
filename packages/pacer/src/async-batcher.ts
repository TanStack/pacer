import { Store } from '@tanstack/store'
import { createKey, parseFunctionOrValue } from './utils'
import { emitChange, pacerEventClient } from './event-client'
import type { OptionalKeys } from './types'

export interface AsyncBatcherState<TValue> {
  /**
   * Number of batch executions that have resulted in errors
   */
  errorCount: number
  /**
   * Array of items that failed during batch processing
   */
  failedItems: Array<TValue>
  /**
   * Whether the batcher has no items to process (items array is empty)
   */
  isEmpty: boolean
  /**
   * Whether a batch is currently being processed asynchronously
   */
  isExecuting: boolean
  /**
   * Whether the batcher is waiting for the timeout to trigger batch processing
   */
  isPending: boolean
  /**
   * Array of items currently queued for batch processing
   */
  items: Array<TValue>
  /**
   * The result from the most recent batch execution
   */
  lastResult: any
  /**
   * Number of batch executions that have completed (either successfully or with errors)
   */
  settleCount: number
  /**
   * Number of items currently in the batch queue
   */
  size: number
  /**
   * Current processing status - 'idle' when not processing, 'pending' when waiting for timeout, 'executing' when processing, 'populated' when items are present, but no wait is configured
   */
  status: 'idle' | 'pending' | 'executing' | 'populated'
  /**
   * Number of batch executions that have completed successfully
   */
  successCount: number
  /**
   * Total number of items that have failed processing across all batches
   */
  totalItemsFailed: number
  /**
   * Total number of items that have been processed across all batches
   */
  totalItemsProcessed: number
}

function getDefaultAsyncBatcherState<TValue>(): AsyncBatcherState<TValue> {
  return {
    errorCount: 0,
    failedItems: [],
    isEmpty: true,
    isExecuting: false,
    isPending: false,
    items: [],
    lastResult: undefined,
    settleCount: 0,
    size: 0,
    status: 'idle',
    successCount: 0,
    totalItemsProcessed: 0,
    totalItemsFailed: 0,
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
   * Optional key to identify this async batcher instance.
   * If provided, the async batcher will be identified by this key in the devtools and PacerProvider if applicable.
   */
  key?: string
  /**
   * Maximum number of items in a batch
   * @default Infinity
   */
  maxSize?: number
  /**
   * Optional error handler for when the batch function throws.
   * If provided, the handler will be called with the error, the batch of items that failed, and batcher instance.
   * This can be used alongside throwOnError - the handler will be called before any error is thrown.
   */
  onError?: (
    error: unknown,
    batch: Array<TValue>,
    batcher: AsyncBatcher<TValue>,
  ) => void
  /**
   * Callback fired after items are added to the batcher
   */
  onItemsChange?: (batcher: AsyncBatcher<TValue>) => void
  /**
   * Optional callback to call when a batch is settled (completed or failed)
   */
  onSettled?: (batch: Array<TValue>, batcher: AsyncBatcher<TValue>) => void
  /**
   * Optional callback to call when a batch succeeds
   */
  onSuccess?: (
    result: any,
    batch: Array<TValue>,
    batcher: AsyncBatcher<TValue>,
  ) => void
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
  wait?: number | ((asyncBatcher: AsyncBatcher<TValue>) => number)
}

type AsyncBatcherOptionsWithOptionalCallbacks<TValue> = OptionalKeys<
  Required<AsyncBatcherOptions<TValue>>,
  | 'initialState'
  | 'onError'
  | 'onItemsChange'
  | 'onSettled'
  | 'onSuccess'
  | 'key'
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
 * - If an `onError` handler is provided, it will be called with the error, the batch of items that failed, and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the AsyncBatcher instance
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the async batcher
 * - Use `onSuccess` callback to react to successful batch execution and implement custom logic
 * - Use `onError` callback to react to batch execution errors and implement custom error handling
 * - Use `onSettled` callback to react to batch execution completion (success or error) and implement custom logic
 * - Use `onExecute` callback to react to batch execution and implement custom logic
 * - Use `onItemsChange` callback to react to items being added or removed from the batcher
 * - The state includes total items processed, success/error counts, and execution status
 * - State can be accessed via `asyncBatcher.store.state` when using the class directly
 * - When using framework adapters (React/Solid), state is accessed from `asyncBatcher.state`
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
  readonly store: Store<Readonly<AsyncBatcherState<TValue>>> = new Store(
    getDefaultAsyncBatcherState<TValue>(),
  )
  key: string
  options: AsyncBatcherOptionsWithOptionalCallbacks<TValue>
  #timeoutId: NodeJS.Timeout | null = null

  constructor(
    public fn: (items: Array<TValue>) => Promise<any>,
    initialOptions: AsyncBatcherOptions<TValue>,
  ) {
    this.key = createKey(initialOptions.key)
    this.options = {
      ...defaultOptions,
      ...initialOptions,
      throwOnError: initialOptions.throwOnError ?? !initialOptions.onError,
    }
    this.#setState(this.options.initialState ?? {})

    pacerEventClient.on('d-AsyncBatcher', (event) => {
      if (event.payload.key !== this.key) return
      this.#setState(event.payload.store.state)
      this.setOptions(event.payload.options)
    })
  }

  /**
   * Updates the async batcher options
   */
  setOptions = (newOptions: Partial<AsyncBatcherOptions<TValue>>): void => {
    this.options = { ...this.options, ...newOptions }
  }

  #setState = (newState: Partial<AsyncBatcherState<TValue>>): void => {
    this.store.setState((state) => {
      const combinedState = {
        ...state,
        ...newState,
      }
      const { isExecuting, isPending, items } = combinedState
      const size = items.length
      const isEmpty = size === 0
      return {
        ...combinedState,
        isEmpty,
        size,
        status: isExecuting
          ? 'executing'
          : isPending
            ? 'pending'
            : isEmpty
              ? 'idle'
              : 'populated',
      }
    })
    emitChange('AsyncBatcher', this)
  }

  #getWait = (): number => {
    return parseFunctionOrValue(this.options.wait, this)
  }

  /**
   * Adds an item to the async batcher
   * If the batch size is reached, timeout occurs, or shouldProcess returns true, the batch will be processed
   */
  addItem = (item: TValue): void => {
    this.#setState({
      items: [...this.store.state.items, item],
      isPending: this.options.wait !== Infinity,
    })
    this.options.onItemsChange?.(this)

    const shouldProcess =
      this.store.state.items.length >= this.options.maxSize ||
      this.options.getShouldExecute(this.store.state.items, this)

    if (shouldProcess) {
      this.#execute()
    } else if (this.options.wait !== Infinity) {
      this.#clearTimeout() // clear any pending timeout to replace it with a new one
      this.#timeoutId = setTimeout(() => this.#execute(), this.#getWait())
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
   * @throws The error from the batch function if no onError handler is configured or throwOnError is true
   */
  #execute = async (): Promise<any> => {
    if (this.store.state.items.length === 0) {
      return undefined
    }

    const batch = this.peekAllItems() // copy of the items to be processed (to prevent race conditions)
    this.clear() // Clear items before processing to prevent race conditions
    this.options.onItemsChange?.(this)

    this.#setState({ isExecuting: true })

    try {
      const result = await this.fn(batch) // EXECUTE
      this.#setState({
        totalItemsProcessed:
          this.store.state.totalItemsProcessed + batch.length,
        lastResult: result,
        successCount: this.store.state.successCount + 1,
      })
      this.options.onSuccess?.(result, batch, this)
      return result
    } catch (error) {
      this.#setState({
        errorCount: this.store.state.errorCount + 1,
        failedItems: [...this.store.state.failedItems, ...batch],
        totalItemsFailed: this.store.state.totalItemsFailed + batch.length,
      })
      this.options.onError?.(error, batch, this)
      if (this.options.throwOnError) {
        throw error
      }
      return undefined
    } finally {
      this.#setState({
        isExecuting: false,
        settleCount: this.store.state.settleCount + 1,
      })
      this.options.onSettled?.(batch, this)
    }
  }

  /**
   * Processes the current batch of items immediately
   */
  flush = async (): Promise<any> => {
    this.#clearTimeout() // clear any pending timeout
    return await this.#execute()
  }

  /**
   * Returns a copy of all items in the async batcher
   */
  peekAllItems = (): Array<TValue> => {
    return [...this.store.state.items]
  }

  peekFailedItems = (): Array<TValue> => {
    return [...this.store.state.failedItems]
  }

  #clearTimeout = (): void => {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId)
      this.#timeoutId = null
    }
  }

  /**
   * Removes all items from the async batcher
   */
  clear = (): void => {
    this.#setState({ items: [], failedItems: [], isPending: false })
  }

  /**
   * Resets the async batcher state to its default values
   */
  reset = (): void => {
    this.#setState(getDefaultAsyncBatcherState<TValue>())
    this.options.onItemsChange?.(this)
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
 * - If an `onError` handler is provided, it will be called with the error, the batch of items that failed, and batcher instance
 * - If `throwOnError` is true (default when no onError handler is provided), the error will be thrown
 * - If `throwOnError` is false (default when onError handler is provided), the error will be swallowed
 * - Both onError and throwOnError can be used together - the handler will be called before any error is thrown
 * - The error state can be checked using the underlying AsyncBatcher instance
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - Use `initialState` to provide initial state values when creating the async batcher
 * - Use `onSuccess` callback to react to successful batch execution and implement custom logic
 * - Use `onError` callback to react to batch execution errors and implement custom error handling
 * - Use `onSettled` callback to react to batch execution completion (success or error) and implement custom logic
 * - Use `onExecute` callback to react to batch execution and implement custom logic
 * - Use `onItemsChange` callback to react to items being added or removed from the batcher
 * - The state includes total items processed, success/error counts, and execution status
 * - State can be accessed via the underlying AsyncBatcher instance's `store.state` property
 * - When using framework adapters (React/Solid), state is accessed from the hook's state property
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
