import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncThrottlerState } from '@tanstack/pacer/async-throttler'

import type {
  EmberAsyncThrottler,
  EmberAsyncThrottlerOptions,
} from './useAsyncThrottler'
/** Returns a asyncthrottled callback from an owned Ember helper. Named arguments update the same utility. */
export class UseAsyncThrottledCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncThrottlerState<TFn>) => TSelected]
    Named: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  Return: EmberAsyncThrottler<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberAsyncThrottler<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncThrottlerOptions<TFn, TSelected>
  }
  private selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
    ],
    options: EmberAsyncThrottlerOptions<TFn, TSelected>,
  ): EmberAsyncThrottler<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncThrottler<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncThrottler<TFn, TSelected>
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
    return this.instance.maybeExecute
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

export { UseAsyncThrottledCallback as useAsyncThrottledCallback }
