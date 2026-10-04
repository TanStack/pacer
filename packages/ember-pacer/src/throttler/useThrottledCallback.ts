import { Throttler } from '@tanstack/pacer/throttler'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { ThrottlerState } from '@tanstack/pacer/throttler'

import type { EmberThrottler, EmberThrottlerOptions } from './useThrottler'
/** Returns a throttled callback from an owned Ember helper. Named arguments update the same utility. */
export class UseThrottledCallback<
  TFn extends AnyFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: ThrottlerState<TFn>) => TSelected]
    Named: EmberThrottlerOptions<TFn, TSelected>
  }
  Return: EmberThrottler<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberThrottler<TFn, TSelected>
  private latest?: { fn: TFn; options: EmberThrottlerOptions<TFn, TSelected> }
  private selector: (state: ThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: ThrottlerState<TFn>) => TSelected,
    ],
    options: EmberThrottlerOptions<TFn, TSelected>,
  ): EmberThrottler<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Throttler<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberThrottler<TFn, TSelected>
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

export { UseThrottledCallback as useThrottledCallback }
