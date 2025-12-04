import { useEffect, useMemo, useState } from 'react'
import { Throttler } from '@tanstack/pacer/throttler'
import { useStore } from '@tanstack/react-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/react-store'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

export interface ReactThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Throttler<TFn>, 'store'> {
  /**
   * Reactive state that will be updated and re-rendered when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Readonly<TSelected>
  /**
   * @deprecated Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<ThrottlerState<TFn>>>
}

/**
 * A low-level React hook that creates a `Throttler` instance that limits how often the provided function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc). For a simpler and higher-level hook that
 * integrates directly with React's useState, see useThrottledState.
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
 * - `executionCount`: Number of function executions that have been completed
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last function execution in milliseconds
 * - `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const [value, setValue] = useState(0);
 * const throttler = useThrottler(setValue, { wait: 1000 });
 *
 * // Opt-in to re-render when execution count changes (optimized for tracking executions)
 * const [value, setValue] = useState(0);
 * const throttler = useThrottler(
 *   setValue,
 *   { wait: 1000 },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Opt-in to re-render when throttling state changes (optimized for loading indicators)
 * const [value, setValue] = useState(0);
 * const throttler = useThrottler(
 *   setValue,
 *   { wait: 1000 },
 *   (state) => ({
 *     isPending: state.isPending,
 *     status: state.status
 *   })
 * );
 *
 * // Opt-in to re-render when timing information changes (optimized for timing displays)
 * const [value, setValue] = useState(0);
 * const throttler = useThrottler(
 *   setValue,
 *   { wait: 1000 },
 *   (state) => ({
 *     lastExecutionTime: state.lastExecutionTime,
 *     nextExecutionTime: state.nextExecutionTime
 *   })
 * );
 *
 * // With any state manager
 * const throttler = useThrottler(
 *   (value) => stateManager.setState(value),
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { executionCount, isPending } = throttler.state;
 * ```
 */
export function useThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): ReactThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().throttler,
    ...options,
  } as ThrottlerOptions<TFn>

  const [throttler] = useState(() => new Throttler<TFn>(fn, mergedOptions))

  throttler.fn = fn
  throttler.setOptions(mergedOptions)

  const state = useStore(throttler.store, selector)

  useEffect(() => {
    return () => {
      throttler.cancel()
    }
  }, [throttler])

  return useMemo(
    () =>
      ({
        ...throttler,
        state,
      }) as ReactThrottler<TFn, TSelected>, // omit `store` in favor of `state`
    [throttler, state],
  )
}
