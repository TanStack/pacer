import { shallow } from '@tanstack/store'
import { computed } from '@angular/core'
import { injectAsyncQueuer } from './injectAsyncQueuer'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type {
  AngularAsyncQueuer,
  AngularAsyncQueuerOptions,
} from './injectAsyncQueuer'

/**
 * A readonly signal of pending queue items, with the Angular queuer attached.
 */
export interface AngularAsyncQueuerItems<TValue, TSelected = {}> extends Signal<
  ReadonlyArray<TValue>
> {
  /** The underlying utility ref for adding, processing, and inspecting items. */
  queuer: AngularAsyncQueuer<TValue, TSelected>
  /** Shortcut for queuer.addItem, with the same arguments and return value. */
  addItem: AngularAsyncQueuer<TValue>['addItem']
}

/**
 * Creates a readonly Angular signal of pending asynchronous queue items.
 *
 * Items appear when added and disappear when removed for processing. This signal
 * contains waiting items, not processing results. Use the attached `queuer` methods
 * to add items, start or stop processing, or inspect the queue.
 *
 * Options accept a static object or reactive factory and follow the underlying
 * queuer's lifecycle and provider behavior. The returned function is an Angular signal.
 *
 * @param fn The callback that processes each queued item.
 * @param options Core queue options or a reactive options factory.
 * @returns A readonly items signal with `queuer` and `addItem` attributes.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const items = injectAsyncQueuerItems(
 *   async (item: string) => console.log(item),
 *   { started: false },
 * )
 * items.addItem('job')
 * console.log(items()) // ['job']
 * items.queuer.start()
 * ```
 */
export function injectAsyncQueuerItems<TValue>(
  fn: (value: TValue) => Promise<any>,
  options?: MaybeAccessor<AngularAsyncQueuerOptions<TValue>>,
): AngularAsyncQueuerItems<TValue>
/**
 * Creates the items signal with selected state on its attached queuer.
 * @param selector Selects reactive state exposed on the attached queuer.
 */
export function injectAsyncQueuerItems<TValue, TSelected>(
  fn: (value: TValue) => Promise<any>,
  options: MaybeAccessor<AngularAsyncQueuerOptions<TValue>>,
  selector: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuerItems<TValue, TSelected>
export function injectAsyncQueuerItems<TValue, TSelected>(
  fn: (value: TValue) => Promise<any>,
  options: MaybeAccessor<AngularAsyncQueuerOptions<TValue>> = {},
  selector?: (state: AsyncQueuerState<TValue>) => TSelected,
): AngularAsyncQueuerItems<TValue, TSelected | {}> {
  const utility = injectAsyncQueuer(fn, options, (state) => ({
    items: state.items,
    selected: selector ? selector(state) : {},
  }))
  const items = computed(() => utility.state().items, { equal: shallow })
  const queuer = {
    ...utility,
    state: computed(() => utility.state().selected, {
      equal: shallow,
    }) as Signal<ReadonlySelected<TSelected | {}>>,
  }
  return Object.assign(items, { queuer, addItem: utility.addItem })
}
