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
 * Creates debounced state with a scheduled setter.
 *
 * With the default trailing behavior, each call restarts the wait timer and only the latest pending update executes. Leading and trailing options control the edges.
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
 * import { useDebouncedState } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useDebouncedState 0 wait=500) as |result|}}
 *   <output>{{result.value}}</output>
 *   <button {{on "click" (fn result.setValue 1)}}>Update</button>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useDebouncer
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

export { UseDebouncedState as useDebouncedState }
