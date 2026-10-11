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
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'

import type {
  EmberAsyncQueuer,
  EmberAsyncQueuerOptions,
} from './useAsyncQueuer'
/**
 * Exposes pending queue items together with the queue that processes them.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Yields the queue instance. Read pending items from queue.state.items and enqueue with queue.addItem().
 *
 * ## State and ownership
 *
 * Items are selected by default. A custom selector must retain items and may add other state fields. The returned collection contains pending items; async active items are separate.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useAsyncQueuedState } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useAsyncQueuedState @process wait=500) as |queue|}}
 *   <button {{on "click" (fn queue.addItem 1)}}>Add</button>
 *   <output>{{queue.state.items.length}}</output>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useAsyncQueuer
 */
export class UseAsyncQueuedState<
  TValue,
  TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
    AsyncQueuerState<TValue>,
    'items'
  >,
> extends Helper<{
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
  private selector: (state: AsyncQueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected

  compute(
    [fn, selector]: [
      fn: (item: TValue) => Promise<any>,
      selector?: (state: AsyncQueuerState<TValue>) => TSelected,
    ],
    options: EmberAsyncQueuerOptions<TValue, TSelected>,
  ): EmberAsyncQueuer<TValue, TSelected> {
    this.selector =
      selector ?? ((state) => ({ items: state.items }) as TSelected)
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

export { UseAsyncQueuedState as useAsyncQueuedState }
