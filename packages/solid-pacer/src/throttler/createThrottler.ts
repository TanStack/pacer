import { Throttler } from '@tanstack/pacer/throttler'
import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

export interface SolidThrottler<
  TFn extends AnyFunction,
  TSelected = ThrottlerState<TFn>,
> extends Omit<Throttler<TFn>, 'store'> {
  /**
   * Reactive state that will be updated when the throttler state changes
   *
   * Use this instead of `throttler.store.state`
   */
  readonly state: Accessor<TSelected>
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
 * @example
 * ```tsx
 * // Basic throttling with custom state
 * const [value, setValue] = createSignal(0);
 * const throttler = createThrottler(setValue, { wait: 1000 });
 *
 * // With any state manager
 * const throttler = createThrottler(
 *   (value) => stateManager.setState(value),
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 *
 * // Access throttler state via signals
 * console.log(throttler.executionCount()); // number of times executed
 * console.log(throttler.isPending());      // whether throttled function is pending
 * console.log(throttler.lastExecutionTime()); // timestamp of last execution
 * console.log(throttler.nextExecutionTime()); // timestamp of next allowed execution
 * ```
 */
export function createThrottler<
  TFn extends AnyFunction,
  TSelected = ThrottlerState<TFn>,
>(
  fn: TFn,
  initialOptions: ThrottlerOptions<TFn>,
  selector?: (state: ThrottlerState<TFn>) => TSelected,
): SolidThrottler<TFn, TSelected> {
  const asyncThrottler = new Throttler<TFn>(fn, initialOptions)

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
