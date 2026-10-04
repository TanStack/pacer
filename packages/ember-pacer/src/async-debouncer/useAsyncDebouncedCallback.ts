import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncDebouncerState } from '@tanstack/pacer/async-debouncer'

import type {
  EmberAsyncDebouncer,
  EmberAsyncDebouncerOptions,
} from './useAsyncDebouncer'
/** Returns a asyncdebounced callback from an owned Ember helper. Named arguments update the same utility. */
export class UseAsyncDebouncedCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberAsyncDebouncer<TFn, TSelected>
  private latest?: {
    fn: TFn
    options: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  private selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: AsyncDebouncerState<TFn>) => TSelected,
    ],
    options: EmberAsyncDebouncerOptions<TFn, TSelected>,
  ): EmberAsyncDebouncer<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new AsyncDebouncer<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberAsyncDebouncer<TFn, TSelected>
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

export { UseAsyncDebouncedCallback as useAsyncDebouncedCallback }
