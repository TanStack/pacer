import { DestroyRef, inject } from '@angular/core'
import { injectStore } from '@tanstack/angular-store'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface AngularAsyncQueuerOptions<
  TValue,
  TSelected = {},
> extends AsyncQueuerOptions<TValue> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the queuer instance.
   * When provided, replaces the default cleanup (stop + abort); use it to call flush(), stop(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (queuer: AngularAsyncQueuer<TValue, TSelected>) => void
}

export interface AngularAsyncQueuer<TValue, TSelected = {}> extends Omit<
  AsyncQueuer<TValue>,
  'store'
> {
  /**
   * Reactive state signal that will be updated when the async queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncQueuerState<TValue>>>
}

/**
 * An Angular function that creates and manages an AsyncQueuer instance.
 *
 * This is a lower-level function that provides direct access to the AsyncQueuer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The AsyncQueuer processes items asynchronously with support for concurrent execution,
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
 * ## Cleanup on Destroy
 *
 * By default, the function stops the queuer and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending items instead:
 *
 * ```ts
 * const queuer = injectAsyncQueuer(fn, {
 *   concurrency: 2,
 *   onUnmount: (q) => q.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const queuer = injectAsyncQueuer(
 *   async (item: Data) => {
 *     const response = await fetch('/api/process', {
 *       method: 'POST',
 *       body: JSON.stringify(item)
 *     });
 *     return response.json();
 *   },
 *   { concurrency: 2, wait: 1000 }
 * );
 *
 * // Add items
 * queuer.addItem(data1);
 * queuer.addItem(data2);
 *
 * // Access the selected state
 * const { items, isExecuting } = queuer.state();
 * ```
 */
export function injectAsyncQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => Promise<any>,
  options: AngularAsyncQueuerOptions<TValue, TSelected> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().asyncQueuer,
    ...options,
  } as AngularAsyncQueuerOptions<TValue, TSelected>

  const queuer = new AsyncQueuer<TValue>(fn, mergedOptions)
  const state = injectStore(queuer.store, selector)

  const result = {
    ...queuer,
    state,
  } as AngularAsyncQueuer<TValue, TSelected>

  const destroyRef = inject(DestroyRef, { optional: true })
  destroyRef?.onDestroy(() => {
    if (mergedOptions.onUnmount) {
      mergedOptions.onUnmount(result)
    } else {
      queuer.stop()
      queuer.abort()
    }
  })

  return result
}
