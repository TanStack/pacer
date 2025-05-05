import { Throttler } from '@tanstack/pacer/throttler'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * An extension of the Throttler class that adds Solid signals to access the internal state of the throttler
 */
export interface SolidThrottler<TFn extends AnyFunction>
  extends Omit<
    Throttler<TFn>,
    | 'getExecutionCount'
    | 'getIsPending'
    | 'getLastExecutionTime'
    | 'getNextExecutionTime'
  > {
  executionCount: Accessor<number>
  isPending: Accessor<boolean>
  lastExecutionTime: Accessor<number>
  nextExecutionTime: Accessor<number>
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
export function createThrottler<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: ThrottlerOptions<TFn>,
): SolidThrottler<TFn> {
  const throttler = bindInstanceMethods(new Throttler<TFn>(fn, initialOptions))

  const [executionCount, setExecutionCount] = createSignal(
    throttler.getExecutionCount(),
  )
  const [isPending, setIsPending] = createSignal(throttler.getIsPending())
  const [lastExecutionTime, setLastExecutionTime] = createSignal(
    throttler.getLastExecutionTime(),
  )
  const [nextExecutionTime, setNextExecutionTime] = createSignal(
    throttler.getNextExecutionTime(),
  )

  function setOptions(newOptions: Partial<ThrottlerOptions<TFn>>) {
    throttler.setOptions({
      ...newOptions,
      onExecute: (throttler) => {
        setExecutionCount(throttler.getExecutionCount())
        setIsPending(throttler.getIsPending())
        setLastExecutionTime(throttler.getLastExecutionTime())
        setNextExecutionTime(throttler.getNextExecutionTime())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(throttler)
      },
    })
  }

  setOptions(initialOptions)

  createEffect(() => {
    onCleanup(() => {
      throttler.cancel()
    })
  })

  return {
    ...throttler,
    executionCount,
    isPending,
    lastExecutionTime,
    nextExecutionTime,
    setOptions,
  } as SolidThrottler<TFn>
}
