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
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { EmberDebouncer, EmberDebouncerOptions } from './useDebouncer'
/** Reactive value, update method, and underlying utility returned by useDebouncedValue. */
export interface EmberDebouncedValue<TValue, TSelected = {}> {
  readonly value: TValue
  setValue: (value: TValue) => void
  utility: EmberDebouncer<(value: TValue) => void, TSelected>
}

/**
 * Derives a debounced value from its tracked positional input.
 * Reads and renders through the returned value property. The utility exposes all control methods.
 * Named options update after rendering; pending work is preserved until owner cleanup.
 */
export class UseDebouncedValue<TValue, TSelected = {}> extends Helper<{
  Args: {
    Positional:
      | [value: TValue]
      | [
          value: TValue,
          selector: (
            state: DebouncerState<(value: TValue) => void>,
          ) => TSelected,
        ]
    Named: EmberDebouncerOptions<(value: TValue) => void, TSelected>
  }
  Return: EmberDebouncedValue<TValue, TSelected>
}> {
  private result?: EmberDebouncedValue<TValue, TSelected>
  private latest?: {
    value: TValue
    options: EmberDebouncerOptions<(value: TValue) => void, TSelected>
  }
  private previous?: TValue
  private selector: (
    state: DebouncerState<(value: TValue) => void>,
  ) => TSelected = () => ({}) as TSelected
  compute(
    [value, selector]: [
      TValue,
      ((state: DebouncerState<(value: TValue) => void>) => TSelected)?,
    ],
    options: EmberDebouncerOptions<(value: TValue) => void, TSelected>,
  ): EmberDebouncedValue<TValue, TSelected> {
    this.selector = selector ?? (() => ({}) as TSelected)
    this.latest = { value, options: { ...options } }
    if (!this.result) {
      const cell = trackedObject({ value })
      const utility = new Debouncer<(value: TValue) => void>((next) => {
        cell.value = next
      }, this.latest.options) as unknown as EmberDebouncer<
        (value: TValue) => void,
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
      this.previous = value
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
    if (!Object.is(this.previous, this.latest.value)) {
      this.previous = this.latest.value
      this.result.setValue(this.latest.value)
    }
  }
}

export { UseDebouncedValue as useDebouncedValue }
