import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { SetValue } from '../utils/cell'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type {
  EmberRateLimiter,
  EmberRateLimiterOptions,
} from './useRateLimiter'
/** Reactive value, update method, and underlying utility returned by useRateLimitedState. */
export interface EmberRateLimitedState<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: SetValue<TValue>
  utility: EmberRateLimiter<SetValue<TValue>, TSelected>
}

/**
 * Creates rate-limited state with a scheduled setter.
 *
 * Accepts updates while the configured limit has capacity in its fixed or sliding window. Rejected updates are discarded instead of delayed.
 *
 * ## Return value
 *
 * Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Setters accept a value or a functional updater. Updaters run when the utility executes, using the last committed value. Pending updates may be replaced or rejected according to the utility's scheduling rules. To store a function itself, pass an updater that returns that function.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Invoke in a Glimmer template. Positional arguments provide the callback or value and optional selector. Named arguments provide options. Removing the invocation runs cleanup.
 * Tracked named arguments refresh options after rendering. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```gts
 * import { on } from '@ember/modifier'
 * import { fn } from '@ember/helper'
 * import { useRateLimitedState } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useRateLimitedState 0 limit=3 window=1000) as |result|}}
 *   <output>{{result.value}}</output>
 *   <button {{on "click" (fn result.setValue 1)}}>Update</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useRateLimiter
 */
export class UseRateLimitedState<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: RateLimiterState) => TSelected]
    Named: EmberRateLimiterOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberRateLimitedState<TValue, TSelected>
}> {
  private result?: EmberRateLimitedState<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberRateLimiterOptions<SetValue<TValue>, TSelected>
  }
  private selector: (state: RateLimiterState) => TSelected = () =>
    ({}) as TSelected
  compute(
    [value, selector]: [TValue, ((state: RateLimiterState) => TSelected)?],
    options: EmberRateLimiterOptions<SetValue<TValue>, TSelected>,
  ): EmberRateLimitedState<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new RateLimiter<SetValue<TValue>>((next) => {
        cell.value =
          typeof next === 'function'
            ? (next as (previous: TValue) => TValue)(cell.value)
            : next
      }, this.latest.options) as unknown as EmberRateLimiter<
        SetValue<TValue>,
        TSelected
      >
      const selected = select(this, utility.store, (state) =>
        this.selector(state),
      )
      Object.defineProperty(utility, 'Subscribe', {
        value: createSubscribe(utility.store),
        enumerable: true,
      })
      Object.defineProperty(utility, 'state', {
        get: () => selected.value,
        enumerable: true,
      })
      this.result = {
        get value() {
          return cell.value
        },
        setValue: (next) => {
          utility.maybeExecute(next)
        },
        utility,
      }
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
        }
      })
    } else scheduleOnce('afterRender', this, this.update)
    return this.result
  }
  private update() {
    if (!this.latest || !this.result || isDestroyed(this) || isDestroying(this))
      return
    this.result.utility.setOptions(this.latest.options)
  }
}

export { UseRateLimitedState as useRateLimitedState }
