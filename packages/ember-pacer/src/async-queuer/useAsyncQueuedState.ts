import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'

import type {
  EmberAsyncQueuer,
  EmberAsyncQueuerOptions,
} from './useAsyncQueuer'
/** Returns the queue with pending items selected by default. */
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
      const instance = new AsyncQueuer<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncQueuer<TValue, TSelected>
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
