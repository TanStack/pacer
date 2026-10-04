import { Queuer } from '@tanstack/pacer/queuer'
import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { select } from '../utils/select'
import type { QueuerState } from '@tanstack/pacer/queuer'

import type { EmberQueuer, EmberQueuerOptions } from './useQueuer'
/** Returns the queue with pending items selected by default. */
export class UseQueuedState<
  TValue,
  TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
    QueuerState<TValue>,
    'items'
  >,
> extends Helper<{
  Args: {
    Positional:
      | [fn: (item: TValue) => void]
      | [
          fn: (item: TValue) => void,
          selector: (state: QueuerState<TValue>) => TSelected,
        ]
    Named: EmberQueuerOptions<TValue, TSelected>
  }
  Return: EmberQueuer<TValue, TSelected>
}> {
  private instance?: EmberQueuer<TValue, TSelected>
  private latest?: {
    fn: (item: TValue) => void
    options: EmberQueuerOptions<TValue, TSelected>
  }
  private selector: (state: QueuerState<TValue>) => TSelected = (state) =>
    ({ items: state.items }) as TSelected

  compute(
    [fn, selector]: [
      fn: (item: TValue) => void,
      selector?: (state: QueuerState<TValue>) => TSelected,
    ],
    options: EmberQueuerOptions<TValue, TSelected>,
  ): EmberQueuer<TValue, TSelected> {
    this.selector =
      selector ?? ((state) => ({ items: state.items }) as TSelected)
    this.latest = { fn, options: { ...options } }
    if (!this.instance) {
      const instance = new Queuer<TValue>(
        fn,
        this.latest.options,
      ) as unknown as EmberQueuer<TValue, TSelected>
      const selected = select(this, instance.store, (state) =>
        this.selector(state),
      )
      Object.defineProperty(instance, 'state', {
        get: () => selected.value,
        enumerable: true,
      })
      this.instance = instance
      registerDestructor(this, () => {
        if (instance.options.onUnmount) instance.options.onUnmount(instance)
        else {
          instance.stop()
        }
      })
    } else {
      scheduleOnce('afterRender', this, this.update)
    }
    return this.instance
  }

  private update() {
    if (
      this.instance &&
      this.latest &&
      !isDestroying(this) &&
      !isDestroyed(this)
    ) {
      this.instance.fn = this.latest.fn
      this.instance.setOptions(this.latest.options)
    }
  }
}

export { UseQueuedState as useQueuedState }
