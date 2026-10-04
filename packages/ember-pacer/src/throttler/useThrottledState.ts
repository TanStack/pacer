import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Throttler } from '@tanstack/pacer/throttler'
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
 * Creates throttled state from an initial value.
 * Reads and renders through the returned value property. The utility exposes all control methods.
 * Named options update after rendering; pending work is preserved until owner cleanup.
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
