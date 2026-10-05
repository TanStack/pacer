import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { initializeQueue } from '../utils/initializeQueue'
import { select } from '../utils/select'
import type { EmberPacerSubscribe } from '../utils/Subscribe'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

/** Options for useAsyncQueuer, including owner cleanup. */
export interface EmberAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: EmberAsyncQueuer<TValue, TSelected>) => void
}

/** An AsyncQueuer with framework-reactive selected state. All core methods remain available. */
export interface EmberAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'options' | 'setOptions'
> {
  options: AsyncQueuer<TValue>['options'] &
    EmberAsyncQueuerOptions<TValue, TSelected>
  setOptions: (
    options: Partial<EmberAsyncQueuerOptions<TValue, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: EmberPacerSubscribe<AsyncQueuerState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the AsyncQueuer for its Ember owner.
 *
 * Retains items until they are processed. Use addItem to enqueue work and start, stop, execute, clear, or flush to control processing. Selected state exposes pending items, capacity, and completed work.
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
 * - `activeItems`: Items currently being processed by the queuer
 * - `addItemCount`: Number of times addItem has been called (for reduction calculations)
 * - `errorCount`: Number of task executions that have resulted in errors
 * - `executionCount`: Number of times execute has been called
 * - `expirationCount`: Number of items that have been removed from the queue due to expiration
 * - `isEmpty`: Whether the queuer has no items to process (items array is empty)
 * - `isExecuting`: Whether the queuer is currently executing
 * - `isFull`: Whether the queuer has reached its maximum capacity
 * - `isIdle`: Whether the queuer is not currently processing any items
 * - `isRunning`: Whether the queuer is active and will process items automatically
 * - `items`: Array of items currently waiting to be processed
 * - `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
 * - `lastResult`: The result from the most recent task execution
 * - `pendingTick`: Whether the queuer has a pending timeout for processing the next item
 * - `rejectionCount`: Number of items that have been rejected from being added to the queue
 * - `settleCount`: Number of task executions that have completed (either successfully or with errors)
 * - `size`: Number of items currently in the queue
 * - `status`: Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused
 * - `successCount`: Number of task executions that have completed successfully
 *
 * ## Options and ownership
 *
 * Tracked named arguments update options after rendering. createPacerScope supplies shared
 * defaults through contextual helpers. Local named options override those defaults.
 * Removing the helper invocation calls stop() and abort().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useAsyncQueuer } from '@tanstack/ember-pacer'
 * import type { AsyncQueuerState } from '@tanstack/ember-pacer'
 *
 * const select = (state: AsyncQueuerState<string>) => ({ size: state.size })
 *
 * <template>
 *   {{#let (useAsyncQueuer @process select wait=100) as |utility|}}
 *     <button {{on "click" (fn utility.addItem "item")}}>Schedule</button>
 *     <span>{{utility.state.size}}</span>
 *   {{/let}}
 * </template>
 * ```
 */
export class UseAsyncQueuer<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => Promise<any>]
      | [
          fn: (item: TValue) => Promise<any>,
          selector: (state: AsyncQueuerState<TValue>) => TSelected,
        ]
    Named: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  Return: EmberAsyncQueuer<TValue, TSelected>
}> {
  private instance?: EmberAsyncQueuer<TValue, TSelected>
  private latest?: {
    fn: (item: TValue) => Promise<any>
    options: EmberAsyncQueuerOptions<TValue, TSelected>
  }
  private selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: (item: TValue) => Promise<any>,
      selector?: (state: AsyncQueuerState<TValue>) => TSelected,
    ],
    options: EmberAsyncQueuerOptions<TValue, TSelected>,
  ): EmberAsyncQueuer<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncQueuer<TValue>(fn, {
        ...this.latest.options,
        initialItems: undefined,
        started: false,
        initialState: { ...this.latest.options.initialState, isRunning: false },
      }) as unknown as EmberAsyncQueuer<TValue, TSelected>
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
      instance.setOptions(this.latest.options)
      initializeQueue(this, instance, this.latest.options)
      registerDestructor(this, () => {
        if (instance.options.onUnmount) instance.options.onUnmount(instance)
        else {
          instance.stop()
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

export { UseAsyncQueuer as useAsyncQueuer }
