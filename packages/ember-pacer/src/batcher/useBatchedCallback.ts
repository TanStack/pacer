import { Batcher } from '@tanstack/pacer/batcher'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { BatcherState } from '@tanstack/pacer/batcher'

import type { EmberBatcher, EmberBatcherOptions } from './useBatcher'
/** Returns a batched callback from an owned Ember helper. Named arguments update the same utility. */
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
