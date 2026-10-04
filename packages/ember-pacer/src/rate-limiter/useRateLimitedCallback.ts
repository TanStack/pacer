import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

import type {
  EmberRateLimiter,
  EmberRateLimiterOptions,
} from './useRateLimiter'
/** Returns a ratelimited callback from an owned Ember helper. Named arguments update the same utility. */
export class UseRateLimitedCallback<
  TFn extends AnyFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberRateLimiter<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberRateLimiter<TFn, TSelected>
  private latest?: { fn: TFn; options: EmberRateLimiterOptions<TFn, TSelected> }
  private selector: (state: RateLimiterState) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: RateLimiterState) => TSelected,
    ],
    options: EmberRateLimiterOptions<TFn, TSelected>,
  ): EmberRateLimiter<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new RateLimiter<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberRateLimiter<TFn, TSelected>
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

export { UseRateLimitedCallback as useRateLimitedCallback }
