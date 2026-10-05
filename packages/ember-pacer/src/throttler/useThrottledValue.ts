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
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { EmberThrottler, EmberThrottlerOptions } from './useThrottler'
/** Reactive value, update method, and underlying utility returned by useThrottledValue. */
export interface EmberThrottledValue<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: (value: TValue) => void
  utility: EmberThrottler<(value: TValue) => void, TSelected>
}

/**
 * Derives a throttled value from its current source.
 *
 * Limits execution to the configured wait interval. Leading and trailing execution are enabled by default, and the latest blocked update is retained for the trailing edge.
 *
 * ## Return value
 *
 * Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Pass the current tracked value as the first positional argument. The initial value is available immediately. Source changes schedule updates on the existing utility.
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
 * import { useThrottledValue } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useThrottledValue @source wait=500) as |result|}}
 *   <output>{{result.value}}</output>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useThrottler
 */
export class UseThrottledValue<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (
            state: ThrottlerState<(value: TValue) => void>,
          ) => TSelected,
        ]
    Named: EmberThrottlerOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberThrottledValue<TValue, TSelected>
}> {
  private result?: EmberThrottledValue<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberThrottlerOptions<(value: TValue) => void, TSelected>
  }
  private initialized = false
  private previous?: TValue
  private selector: (
    state: ThrottlerState<(value: TValue) => void>,
  ) => TSelected = () => ({}) as TSelected
  compute(
    [value, selector]: [
      TValue,
      ((state: ThrottlerState<(value: TValue) => void>) => TSelected)?,
    ],
    options: EmberThrottlerOptions<(value: TValue) => void, TSelected>,
  ): EmberThrottledValue<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new Throttler<(value: TValue) => void>((next) => {
        cell.value = next
      }, this.latest.options) as unknown as EmberThrottler<
        (value: TValue) => void,
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
      this.previous = value
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
          utility.cancel()
        }
      })
    }
    scheduleOnce('afterRender', this, this.update)
    return this.result
  }
  private update() {
    if (!this.latest || !this.result || isDestroyed(this) || isDestroying(this))
      return
    this.result.utility.setOptions(this.latest.options)
    if (!this.initialized || !Object.is(this.previous, this.latest.value)) {
      this.initialized = true
      this.previous = this.latest.value
      this.result.setValue(this.latest.value)
    }
  }
}

export { UseThrottledValue as useThrottledValue }
