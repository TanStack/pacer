import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { select } from '../utils/select'
import type { SetValue } from '../utils/cell'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { EmberDebouncer, EmberDebouncerOptions } from './useDebouncer'
/** Reactive value, update method, and underlying utility returned by useDebouncedState. */
export interface EmberDebouncedState<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: SetValue<TValue>
  utility: EmberDebouncer<SetValue<TValue>, TSelected>
}

/**
 * Creates debounced state from an initial value.
 * Reads and renders through the returned value property. The utility exposes all control methods.
 * Named options update after rendering; pending work is preserved until owner cleanup.
 */
export class UseDebouncedState<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (state: DebouncerState<SetValue<TValue>>) => TSelected,
        ]
    Named: EmberDebouncerOptions<SetValue<TValue>, TSelected>
  }
  Return: EmberDebouncedState<TValue, TSelected>
}> {
  private result?: EmberDebouncedState<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberDebouncerOptions<SetValue<TValue>, TSelected>
  }
  private selector: (state: DebouncerState<SetValue<TValue>>) => TSelected =
    () => ({}) as TSelected
  compute(
    [value, selector]: [
      TValue,
      ((state: DebouncerState<SetValue<TValue>>) => TSelected)?,
    ],
    options: EmberDebouncerOptions<SetValue<TValue>, TSelected>,
  ): EmberDebouncedState<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new Debouncer<SetValue<TValue>>((next) => {
        cell.value =
          typeof next === 'function'
            ? (next as (previous: TValue) => TValue)(cell.value)
            : next
      }, this.latest.options) as unknown as EmberDebouncer<
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

export { UseDebouncedState as useDebouncedState }
