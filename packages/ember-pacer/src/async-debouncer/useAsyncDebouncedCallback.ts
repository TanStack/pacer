import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type { AsyncDebouncerState } from '@tanstack/pacer/async-debouncer'

import type {
  EmberAsyncDebouncer,
  EmberAsyncDebouncerOptions,
} from './useAsyncDebouncer'
/**
 * Returns a stable debounced callback owned by the Ember lifecycle.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. The returned Promise preserves the core result and error contract. A replaced trailing call resolves with the previous lastResult; it does not wait for the newer call.
 *
 * ## State and ownership
 *
 * Use useAsyncDebouncer when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useAsyncDebouncedCallback } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useAsyncDebouncedCallback @process wait=500) as |schedule|}}
 *   <button {{on "click" (fn schedule 1)}}>Schedule</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useAsyncDebouncer
 */
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
