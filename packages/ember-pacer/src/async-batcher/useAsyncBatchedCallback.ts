import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AsyncBatcherState } from '@tanstack/pacer/async-batcher'

import type {
  EmberAsyncBatcher,
  EmberAsyncBatcherOptions,
} from './useAsyncBatcher'
/** Returns a asyncbatched callback from an owned Ember helper. Named arguments update the same utility. */
export class UseAsyncBatchedCallback<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [fn: (items: Array<TValue>) => Promise<any>]
      | [
          fn: (items: Array<TValue>) => Promise<any>,
          selector: (state: AsyncBatcherState<TValue>) => TSelected,
        ]
    Named: EmberAsyncBatcherOptions<TValue, TSelected>
  }
  Return: EmberAsyncBatcher<TValue, TSelected>['addItem']
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
  ): EmberAsyncBatcher<TValue, TSelected>['addItem'] {
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

export { UseAsyncBatchedCallback as useAsyncBatchedCallback }
