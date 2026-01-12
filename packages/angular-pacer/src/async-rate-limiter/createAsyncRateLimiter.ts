import { signal, Signal } from '@angular/core'
import { DestroyRef, inject } from '@angular/core'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { useDefaultPacerOptions } from '../provider/pacer-context'
import type { Store } from '@tanstack/store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'

export interface AngularAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the async rate limiter state changes
   *
   * Use this instead of `rateLimiter.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `rateLimiter.state` instead of `rateLimiter.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>
}

/**
 * An Angular function that creates and manages an AsyncRateLimiter instance.
 *
 * This is a lower-level function that provides direct access to the AsyncRateLimiter's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async rate limiting functionality with promise support, error handling,
 * retry capabilities, and abort support.
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
 * const rateLimiter = createAsyncRateLimiter(
 *   async (id: string) => {
 *     const response = await fetch(`/api/data/${id}`);
 *     return response.json();
 *   },
 *   { limit: 5, window: 60000, windowType: 'sliding' }
 * );
 *
 * // In an event handler
 * const handleRequest = async (id: string) => {
 *   const result = await rateLimiter.maybeExecute(id);
 *   console.log('Result:', result);
 * };
 * ```
 */
export function createAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncRateLimiter,
    ...options,
  } as AsyncRateLimiterOptions<TFn>

  const rateLimiter = new AsyncRateLimiter<TFn>(fn, mergedOptions)
  const stateSignal = signal<Readonly<TSelected>>(
    selector(rateLimiter.store.state) as Readonly<TSelected>,
  )

  // Subscribe to store changes and update signal
  const unsubscribe = rateLimiter.store.subscribe((state) => {
    const selected = selector(state)
    stateSignal.set(selected as Readonly<TSelected>)
  })

  const destroyRef = inject(DestroyRef, { optional: true })
  if (destroyRef) {
    destroyRef.onDestroy(() => {
      unsubscribe()
      rateLimiter.reset()
    })
  }

  return {
    ...rateLimiter,
    state: stateSignal.asReadonly(),
  } as AngularAsyncRateLimiter<TFn, TSelected>
}
