import { RateLimiter } from '@tanstack/pacer/rate-limiter'
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
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'

import type {
  EmberRateLimiter,
  EmberRateLimiterOptions,
} from './useRateLimiter'
/**
 * Returns a stable rate-limited callback owned by the Ember lifecycle.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Returns the bound maybeExecute method with the wrapped function's parameter types. It returns an accepted-or-rejected boolean.
 *
 * ## State and ownership
 *
 * Use useRateLimiter when you need selected state or control methods. This callback does not expose the utility, its store, or a child subscription.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useRateLimitedCallback } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useRateLimitedCallback @process limit=3 window=1000) as |schedule|}}
 *   <button {{on "click" (fn schedule 1)}}>Schedule</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useRateLimiter
 */
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
