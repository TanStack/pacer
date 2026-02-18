import { DestroyRef, inject } from '@angular/core'
import { injectStore } from '@tanstack/angular-store'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { injectPacerOptions } from '../provider/pacer-context'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/angular-store'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'

export interface AngularAsyncDebouncerOptions<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends AsyncDebouncerOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the debouncer instance.
   * When provided, replaces the default cleanup (cancel + abort); use it to call flush(), cancel(), add logging, etc.
   * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
   */
  onUnmount?: (debouncer: AngularAsyncDebouncer<TFn, TSelected>) => void
}

export interface AngularAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncDebouncer<TFn>, 'store'> {
  /**
   * Reactive state signal that will be updated when the async debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>
}

/**
 * An Angular function that creates and manages an AsyncDebouncer instance.
 *
 * This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides async debouncing functionality with promise support, error handling,
 * retry capabilities, and abort support.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
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
 * Available state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `errorCount`: Number of function executions that have resulted in errors
 * - `isExecuting`: Whether the debounced function is currently executing asynchronously
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastResult`: The result from the most recent successful function execution
 * - `settleCount`: Number of function executions that have completed (either successfully or with errors)
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
 * - `successCount`: Number of function executions that have completed successfully
 *
 * ## Cleanup on Destroy
 *
 * By default, the function cancels any pending execution and aborts in-flight work when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const debouncer = injectAsyncDebouncer(fn, {
 *   wait: 500,
 *   onUnmount: (d) => d.flush()
 * });
 * ```
 *
 * When using onUnmount with flush, guard your callbacks since the component may already be destroyed.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const debouncer = injectAsyncDebouncer(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`);
 *     return response.json();
 *   },
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isExecuting changes (optimized for loading states)
 * const debouncer = injectAsyncDebouncer(
 *   async (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
 * );
 *
 * // In an event handler
 * const handleChange = async (e: Event) => {
 *   const target = e.target as HTMLInputElement;
 *   const result = await debouncer.maybeExecute(target.value);
 *   console.log('Search results:', result);
 * };
 *
 * // Access the selected state
 * const { isExecuting, errorCount } = debouncer.state();
 * ```
 */
export function injectAsyncDebouncer<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AngularAsyncDebouncerOptions<TFn, TSelected>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): AngularAsyncDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...injectPacerOptions().asyncDebouncer,
    ...options,
  } as AngularAsyncDebouncerOptions<TFn, TSelected>

  const debouncer = new AsyncDebouncer<TFn>(fn, mergedOptions)
  const state = injectStore(debouncer.store, selector)

  const result = {
    ...debouncer,
    state,
  } as AngularAsyncDebouncer<TFn, TSelected>

  const destroyRef = inject(DestroyRef, { optional: true })
  destroyRef?.onDestroy(() => {
    if (mergedOptions.onUnmount) {
      mergedOptions.onUnmount(result)
    } else {
      debouncer.cancel()
      debouncer.abort()
    }
  })

  return result
}
