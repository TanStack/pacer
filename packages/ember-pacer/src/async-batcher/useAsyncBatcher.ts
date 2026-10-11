import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { EmberPacerSubscribe } from '../utils/Subscribe'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

/** Options for useAsyncBatcher, including owner cleanup. */
export interface EmberAsyncBatcherOptions<
  TValue,
  TSelected = {},
> extends AsyncBatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncBatcher<TValue, TSelected>) => void
}

/** An AsyncBatcher with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncBatcher<TValue>['options'] &
    EmberAsyncBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<EmberAsyncBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<AsyncBatcherState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncBatcher for its Ember owner.
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
 * The selector is the second positional argument. Read utility.state from the template.
 * The contextual utility.Subscribe helper selects state for a child template.
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
 * Tracked named arguments update options after rendering. createPacerScope supplies shared
 * defaults through contextual helpers. Local named options override those defaults.
 * Removing the helper invocation calls cancel() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useAsyncBatcher } from '@tanstack/ember-pacer'
 * import type { AsyncBatcherState } from '@tanstack/ember-pacer'
 *
 * const select = (state: AsyncBatcherState<string>) => ({ size: state.size })
 *
 * <template>
 *   {{#let (useAsyncBatcher @process select maxSize=5 wait=1000) as |utility|}}
 *     <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
 *     <span>{{utility.state.size}}</span>
 *   {{/let}}
 * </template>
 * ```
 */
export class UseAsyncBatcher<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => Promise<any>]
      | [
          fn: (items: Array<TValue>) => Promise<any>,
          selector: (state: AsyncBatcherState<TValue>) => TSelected,
        ]
    Named: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  Return: EmberAsyncBatcher<TValue, TSelected>
}> {
  private instance?: EmberAsyncBatcher<TValue, TSelected>
  private latest?: {
    fn: (items: Array<TValue>) => Promise<any>
    options: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  private selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (items: Array<TValue>) => Promise<any>,
      selector?: (state: AsyncBatcherState<TValue>) => TSelected,
    ],
    options: EmberAsyncBatcherOptions<TValue, TSelected>,
  ): EmberAsyncBatcher<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncBatcher<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncBatcher<TValue, TSelected>
      const selected = select(this, instance.store, (state) =>
        this.selector(state),
      )
      Object.defineProperty(instance, 'Subscribe', {
        value: createSubscribe(instance.store),
        enumerable: true,
      })
      Object.defineProperty(instance, 'state', {
        get: () => selected.value,
        enumerable: true,
      })
      this.instance = instance
      registerDestructor(this, () => {
        if (instance.options.onUnmount) instance.options.onUnmount(instance)
        else {
          instance.cancel()
          instance.abort()
        }
      })
    } else {
      scheduleOnce('afterRender', this, this.update)
    }
    return this.instance
  }

  private update() {
    if (
      this.instance &&
      this.latest &&
      !isDestroying(this) &&
      !isDestroyed(this)
    ) {
      this.instance.fn = this.latest.fn
      this.instance.setOptions(this.latest.options)
    }
  }
}

export { UseAsyncBatcher as useAsyncBatcher }
