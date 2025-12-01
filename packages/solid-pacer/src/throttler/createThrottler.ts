import { Throttler } from '@tanstack/pacer/throttler'
import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

export interface SolidThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'store'> {
  /**
   * Reactive state that will be updated when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<ThrottlerState<TFn>>>
}

/**
 * A low-level Solid hook that creates a `Throttler` instance that limits how often the provided function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (createSignal, Redux, Zustand, Jotai, etc). For a simpler and higher-level hook that
 * integrates directly with Solid's createSignal, see createThrottledSignal.
 *
 * Throttling ensures a function executes at most once within a specified time window,
 * regardless of how many times it is called. This is useful for rate-limiting
 * expensive operations or UI updates.
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
 * to specify which state changes will trigger a re-render, optimizing performance by preventing
 * unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary re-renders and gives you
 * full control over when your component updates. Only when you provide a selector will the
 * component re-render when the selected state values change.
 *
 * Available state properties:
 * - `canLeadingExecute`: Whether the throttler can execute on the leading edge
 * - `canTrailingExecute`: Whether the throttler can execute on the trailing edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last execution
 * - `nextExecutionTime`: Timestamp of the next allowed execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const throttler = createThrottler(setValue, { wait: 1000 });
 *
 * // Opt-in to re-render when isPending changes (optimized for loading states)
 * const throttler = createThrottler(
 *   setValue,
 *   { wait: 1000 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // Opt-in to re-render when executionCount changes (optimized for tracking execution)
 * const throttler = createThrottler(
 *   setValue,
 *   { wait: 1000 },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Multiple state properties - re-render when any of these change
 * const throttler = createThrottler(
 *   setValue,
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   },
 *   (state) => ({
 *     isPending: state.isPending,
 *     executionCount: state.executionCount,
 *     lastExecutionTime: state.lastExecutionTime,
 *     nextExecutionTime: state.nextExecutionTime
 *   })
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending, executionCount } = throttler.state();
 * ```
 */
export function createThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): SolidThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().throttler,
    ...options,
  } as ThrottlerOptions<TFn>

  const asyncThrottler = new Throttler<TFn>(fn, mergedOptions)

  const state = useStore(asyncThrottler.store, selector)

  createEffect(() => {
    onCleanup(() => {
      asyncThrottler.cancel()
    })
  })

  return {
    ...asyncThrottler,
    state,
  } as SolidThrottler<TFn, TSelected> // omit `store` in favor of `state`
}
