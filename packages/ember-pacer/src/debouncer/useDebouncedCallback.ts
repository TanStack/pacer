import { Debouncer } from '@tanstack/pacer/debouncer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { DebouncerState } from '@tanstack/pacer/debouncer'

import type { EmberDebouncer, EmberDebouncerOptions } from './useDebouncer'
/** Returns a debounced callback from an owned Ember helper. Named arguments update the same utility. */
export class UseDebouncedCallback<
  TFn extends AnyFunction,
  TSelected = {},
> extends Helper<{
  Args: {
    Positional:
      [fn: TFn] | [fn: TFn, selector: (state: DebouncerState<TFn>) => TSelected]
    Named: EmberDebouncerOptions<TFn, TSelected>
  }
  Return: EmberDebouncer<TFn, TSelected>['maybeExecute']
}> {
  private instance?: EmberDebouncer<TFn, TSelected>
  private latest?: { fn: TFn; options: EmberDebouncerOptions<TFn, TSelected> }
  private selector: (state: DebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected

  compute(
    [fn, selector]: [
      fn: TFn,
      selector?: (state: DebouncerState<TFn>) => TSelected,
    ],
    options: EmberDebouncerOptions<TFn, TSelected>,
  ): EmberDebouncer<TFn, TSelected>['maybeExecute'] {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Debouncer<TFn>(
        fn,
        this.latest.options,
      ) as unknown as EmberDebouncer<TFn, TSelected>
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

export { UseDebouncedCallback as useDebouncedCallback }
