import { Debouncer } from '@tanstack/pacer/debouncer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { DebouncerState } from '@tanstack/pacer/debouncer'

import type { EmberDebouncer, EmberDebouncerOptions } from './useDebouncer'
/**
 * Returns a stable debounced callback owned by the Ember lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns void, independently of the wrapped callback's return value.
 *
 * ## State and ownership
 *
 * Use useDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useDebouncedCallback } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useDebouncedCallback @process wait=500) as |schedule|}}
 *   <button {{on "click" (fn schedule 1)}}>Schedule</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useDebouncer
 */
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
