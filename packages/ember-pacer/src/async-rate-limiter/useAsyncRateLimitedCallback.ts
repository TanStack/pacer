import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncRateLimiterState } from '@tanstack/pacer/async-rate-limiter'

import type {
  EmberAsyncRateLimiter,
  EmberAsyncRateLimiterOptions,
} from './useAsyncRateLimiter'
/** Returns a asyncratelimited callback from an owned Ember helper. Named arguments update the same utility. */
export class UseAsyncRateLimitedCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncRateLimiterState<TFn>) => TSelected]
    Named: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberAsyncRateLimiter<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberAsyncRateLimiter<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  private selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
    ],
    options: EmberAsyncRateLimiterOptions<TFn, TSelected>,
  ): EmberAsyncRateLimiter<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncRateLimiter<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncRateLimiter<TFn, TSelected>
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

export { UseAsyncRateLimitedCallback as useAsyncRateLimitedCallback }
