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
import type { BatcherState } from '@tanstack/pacer/batcher'

import type { EmberBatcher, EmberBatcherOptions } from './useBatcher'
/**
 * Returns a stable batched callback owned by the Ember lifecycle.
 *
 * Collects items until maxSize, wait, or getShouldExecute triggers a batch. Each call adds one item; the wrapped function receives an array.
 *
 * ## Return value
 *
 * Returns the bound addItem method, which accepts one item per call. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use useBatcher when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useBatchedCallback } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useBatchedCallback @process maxSize=5 wait=500) as |schedule|}}
 *   <button {{on "click" (fn schedule 1)}}>Schedule</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useBatcher
 */
export class UseBatchedCallback<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => void]
      | [
          fn: (items: Array<TValue>) => void,
          selector: (state: BatcherState<TValue>) => TSelected,
        ]
    Named: EmberBatcherOptions<TValue, TSelected>
  }
  Return: EmberBatcher<TValue, TSelected>['addItem']
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
  ): EmberBatcher<TValue, TSelected>['addItem'] {
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
    return this.instance.addItem
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

export { UseBatchedCallback as useBatchedCallback }
