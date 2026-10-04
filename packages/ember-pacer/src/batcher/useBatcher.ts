import { Batcher } from '@tanstack/pacer/batcher'
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
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

/** Options for useBatcher, including owner cleanup. */
export interface EmberBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface EmberBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & EmberBatcherOptions<TValue, TSelected>
  setOptions: (options: Partial<EmberBatcherOptions<TValue, TSelected>>) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<BatcherState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Batcher for its Ember owner.
 *
 * Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.
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
 * - `executionCount`: Number of batch executions that have been completed
 * - `isEmpty`: Whether the batcher has no items to process (items array is empty)
 * - `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
 * - `items`: Array of items currently queued for batch processing
 * - `size`: Number of items currently in the batch queue
 * - `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout
 * - `totalItemsProcessed`: Total number of items that have been processed across all batches
 *
 * ## Options and ownership
 *
 * Tracked named arguments update options after rendering. createPacerScope supplies shared
 * defaults through contextual helpers. Local named options override those defaults.
 * Removing the helper invocation calls cancel().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useBatcher } from '@tanstack/ember-pacer'
 * import type { BatcherState } from '@tanstack/ember-pacer'
 *
 * const select = (state: BatcherState<string>) => ({ size: state.size })
 *
 * <template>
 *   {{#let (useBatcher @process select maxSize=5 wait=1000) as |utility|}}
 *     <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
 *     <span>{{utility.state.size}}</span>
 *   {{/let}}
 * </template>
 * ```
 */
export class UseBatcher<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => void]
      | [
          fn: (items: Array<TValue>) => void,
          selector: (state: BatcherState<TValue>) => TSelected,
        ]
    Named: EmberBatcherOptions<TValue, TSelected>
  }
  Return: EmberBatcher<TValue, TSelected>
}> {
  private instance?: EmberBatcher<TValue, TSelected>
  private latest?: {
    fn: (items: Array<TValue>) => void
    options: EmberBatcherOptions<TValue, TSelected>
  }
  private selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (items: Array<TValue>) => void,
      selector?: (state: BatcherState<TValue>) => TSelected,
    ],
    options: EmberBatcherOptions<TValue, TSelected>,
  ): EmberBatcher<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Batcher<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberBatcher<TValue, TSelected>
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

export { UseBatcher as useBatcher }
