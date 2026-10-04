import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Queuer } from '@tanstack/pacer/queuer'
import { select } from '../utils/select'
import type { QueuerState } from '@tanstack/pacer/queuer'
import type { EmberQueuer, EmberQueuerOptions } from './useQueuer'
/** Reactive value, update method, and underlying utility returned by useQueuedValue. */
export interface EmberQueuedValue<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: (value: TValue) => void
  utility: EmberQueuer<TValue, TSelected>
}

/**
 * Derives a queued value from its tracked positional input.
 * Reads and renders through the returned value property. The utility exposes all control methods.
 * Named options update after rendering; pending work is preserved until owner cleanup.
 */
export class UseQueuedValue<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [value: TValue, selector: (state: QueuerState<TValue>) => TSelected]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuedValue<TValue, TSelected>
}> {
  private result?: EmberQueuedValue<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberQueuerOptions<TValue, TSelected>
  }
  private previous?: TValue
  private selector: (state: QueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected
  compute(
    [value, selector]: [TValue, ((state: QueuerState<TValue>) => TSelected)?],
    options: EmberQueuerOptions<TValue, TSelected>,
  ): EmberQueuedValue<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new Queuer<TValue>((next) => {
        cell.value = next
      }, this.latest.options) as unknown as EmberQueuer<TValue, TSelected>
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
          utility.addItem(next)
        },
        utility,
      }
      this.previous = value
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
          utility.stop()
        }
      })
    } else scheduleOnce('afterRender', this, this.update)
    return this.result
  }
  private update() {
    if (!this.latest || !this.result || isDestroyed(this) || isDestroying(this))
      return
    this.result.utility.setOptions(this.latest.options)
    if (!Object.is(this.previous, this.latest.value)) {
      this.previous = this.latest.value
      this.result.setValue(this.latest.value)
    }
  }
}

export { UseQueuedValue as useQueuedValue }
