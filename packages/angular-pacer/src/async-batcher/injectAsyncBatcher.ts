import { injectStore } from '@tanstack/angular-store'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface AngularAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'store'
> {
  /**
   * Reactive state signal that will be updated when the async batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncBatcherState<TValue>>>
}

/**
 * An Angular function that creates and manages an AsyncBatcher instance.
 *
 * This is a lower-level function that provides direct access to the AsyncBatcher's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The AsyncBatcher collects items and processes them in batches asynchronously with support for
 * promise-based processing, error handling, retry capabilities, and abort support.
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for state management and wraps it with Angular signals.
 * The `selector` parameter allows you to specify which state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary updates when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const batcher = injectAsyncBatcher(
 *   async (items: Array<Data>) => {
 *     const response = await fetch('/api/batch', {
 *       method: 'POST',
 *       body: JSON.stringify(items)
 *     });
 *     return response.json();
 *   },
 *   { maxSize: 10, wait: 2000 }
 * );
 *
 * // Add items
 * batcher.addItem(data1);
 * batcher.addItem(data2);
 *
 * // Access the selected state
 * const { items, isExecuting } = batcher.state();
 * ```
 */
export function injectAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue> = {},
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().asyncBatcher,
    ...options,
  } as AsyncBatcherOptions<TValue>

  const batcher = new AsyncBatcher<TValue>(fn, mergedOptions)
  const state = injectStore(batcher.store, selector)

  return {
    ...batcher,
    state,
  } as AngularAsyncBatcher<TValue, TSelected>
}
