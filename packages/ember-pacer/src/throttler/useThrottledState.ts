import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Throttler } from '@tanstack/pacer/throttler'
import { createSubscribe } from '../utils/Subscribe'
import { select } from '../utils/select'
import type { SetValue } from '../utils/cell'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { EmberThrottler, EmberThrottlerOptions } from './useThrottler'
/** Reactive value, update method, and underlying utility returned by useThrottledState. */
export interface EmberThrottledState<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: SetValue<TValue>
  utility: EmberThrottler<SetValue<TValue>, TSelected>
}

/**
 * Creates throttled state with a scheduled setter.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
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
 * import { useThrottledState } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useThrottledState 0 wait=500) as |result|}}
 *   <output>{{result.value}}</output>
 *   <button {{on "click" (fn result.setValue 1)}}>Update</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useThrottler
 */
export class UseThrottledState<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
        ]
    Named: EmberThrottlerOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberThrottledState<TValue, TSelected>
}> {
  private result?: EmberThrottledState<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberThrottlerOptions<SetValue<TValue>, TSelected>
  }
  private selector: (state: ThrottlerState<SetValue<TValue>>) => TSelected =
    () => ({}) as TSelected
  compute(
    [value, selector]: [
      TValue,
      ((state: ThrottlerState<SetValue<TValue>>) => TSelected)?,
    ],
    options: EmberThrottlerOptions<SetValue<TValue>, TSelected>,
  ): EmberThrottledState<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new Throttler<SetValue<TValue>>((next) => {
        cell.value =
          typeof next === 'function'
            ? (next as (previous: TValue) => TValue)(cell.value)
            : next
      }, this.latest.options) as unknown as EmberThrottler<
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
          utility.cancel()
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

export { UseThrottledState as useThrottledState }
