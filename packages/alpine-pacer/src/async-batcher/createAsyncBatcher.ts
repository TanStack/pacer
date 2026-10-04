import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { bindPacer } from '../utils/bindPacer'
import type { AlpinePacerSubscribe } from '../utils/subscribe'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpinePacerOptions } from '../types'

/** Options for createAsyncBatcher, including owner cleanup. */
export interface AlpineAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: AlpineAsyncBatcher<TValue, TSelected>) => void
}

/** An AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface AlpineAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    AlpineAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<AlpineAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Subscribes a child owner to selected state with automatic cleanup. */
  subscribe: AlpinePacerSubscribe<AsyncBatcherState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncBatcher for its Alpine owner.
 *
 * Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.
 *
 * The callback may return a Promise. Core result, error, retry, and abort behavior is preserved.
 * Use onSuccess, onError, and onSettled for execution outcomes.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Use utility.subscribe(childScope, selector) for a child subscription. It returns a getter
 * and cleans up with the child without canceling the parent utility.
 *
 * Available state fields:
 *
 * - `errorCount`: Number of batch executions that have resulted in errors
 * - `executionCount`: Number of batch executions that have been started
 * - `failedItems`: Array of items that failed during batch processing
 * - `isEmpty`: Whether the batcher has no items to process (items array is empty)
 * - `isExecuting`: Whether a batch is currently being processed asynchronously
 * - `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
 * - `items`: Array of items currently queued for batch processing
 * - `lastResult`: The result from the most recent batch execution
 * - `settleCount`: Number of batch executions that have completed (either successfully or with errors)
 * - `size`: Number of items currently in the batch queue
 * - `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout, 'executing' when processing, 'populated' when items are present, but no wait is configured
 * - `successCount`: Number of batch executions that have completed successfully
 * - `totalItemsFailed`: Total number of items that have failed processing across all batches
 * - `totalItemsProcessed`: Total number of items that have been processed across all batches
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Destroying the owning scope calls cancel() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { createAsyncBatcher } from '@tanstack/alpine-pacer'
 *
 * const utility = createAsyncBatcher(
 *   scope, async (items: Array<string>) => { console.log(items) },
 *   { maxSize: 5, wait: 1000 },
 *   (state) => ({ size: state.size }),
 * )
 * utility.addItem('item')
 * // Selected state: utility.state.size
 * ```
 *
 * @param scope - Owner of option updates, subscriptions, and cleanup.
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function createAsyncBatcher<TValue, TSelected = {}>(
  scope: PacerScope,
  fn: (items: Array<TValue>) => Promise<any>,
  options: AlpinePacerOptions<
    AlpineAsyncBatcherOptions<TValue, TSelected>
  > = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AlpineAsyncBatcher<TValue, TSelected> {
  scope.assertActive()
  const defaults = scope.defaultOptions
  const resolve = (): AlpineAsyncBatcherOptions<TValue, TSelected> => ({
    ...defaults().asyncBatcher,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new AsyncBatcher<TValue>(
    fn,
    resolve(),
  ) as unknown as AlpineAsyncBatcher<TValue, TSelected>
  return bindPacer(scope, instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
    instance.abort()
  })
}
