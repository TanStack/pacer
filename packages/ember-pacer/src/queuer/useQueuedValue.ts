import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { Queuer } from '@tanstack/pacer/queuer'
import { createSubscribe } from '../utils/Subscribe'
import { initializeQueue } from '../utils/initializeQueue'
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
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Yields an object with value, setValue, and utility. Read value in the template; utility exposes controls and selected state. Pass the current tracked value as the first positional argument. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
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
 * import { useQueuedValue } from '@tanstack/ember-pacer'
 *
 * // Inside a component template:
 * <template>
 * {{#let (useQueuedValue @source wait=500) as |result|}}
 *   <output>{{result.value}}</output>
 * {{/let}}
 * </template>
 * ```
 *
 * @see useQueuer
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
  private initialized = false
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
      const utility = new Queuer<TValue>(
        (next) => {
          cell.value = next
        },
        {
          ...this.latest.options,
          initialItems: undefined,
          started: false,
          initialState: {
            ...this.latest.options.initialState,
            isRunning: false,
          },
        },
      ) as unknown as EmberQueuer<TValue, TSelected>
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
          utility.addItem(next)
        },
        utility,
      }
      utility.setOptions(this.latest.options)
      initializeQueue(this, utility, this.latest.options)
      this.previous = value
      registerDestructor(this, () => {
        if (utility.options.onUnmount) utility.options.onUnmount(utility)
        else {
          utility.stop()
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

export { UseQueuedValue as useQueuedValue }
