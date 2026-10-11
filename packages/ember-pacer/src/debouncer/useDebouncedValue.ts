import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { createSubscribe } from '../utils/Subscribe'
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
 * Derives a debounced value from its current source.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
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
 * import { useDebouncedValue } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useDebouncedValue @source wait=500) as |result|}}
 *   <output>{{result.value}}</output>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useDebouncer
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
  private initialized = false
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

export { UseDebouncedValue as useDebouncedValue }
