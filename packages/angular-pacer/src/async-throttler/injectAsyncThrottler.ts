import { injectStore } from '@tanstack/angular-store'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useDefaultPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'

export interface AngularAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncThrottler<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the async throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>
}

/**
 * An Angular function that creates and manages an AsyncThrottler instance.
 *
 * This is a lower-level function that provides direct access to the AsyncThrottler's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async throttling functionality with promise support, error handling,
 * retry capabilities, and abort support.
 *
 * The throttler will execute the function at most once within the specified wait time.
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
 * const throttler = injectAsyncThrottler(
 *   async (data: Data) => {
 *     const response = await fetch('/api/update', {
 *       method: 'POST',
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   },
 *   { wait: 1000 }
 * );
 *
 * // In an event handler
 * const handleUpdate = async (data: Data) => {
 *   const result = await throttler.maybeExecute(data);
 *   console.log('Update result:', result);
 * };
 * ```
 */
export function injectAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncThrottler,
    ...options,
  } as AsyncThrottlerOptions<TFn>

  const throttler = new AsyncThrottler<TFn>(fn, mergedOptions)
  const state = injectStore(throttler.store, selector)

  return {
    ...throttler,
    state,
  } as AngularAsyncThrottler<TFn, TSelected>
}
