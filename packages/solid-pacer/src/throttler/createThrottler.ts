import { Throttler } from '@tanstack/pacer/throttler'
import { createSignal } from 'solid-js'
import { bindInstanceMethods } from '../utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * An extension of the Throttler class that adds Solid signals to access the internal state of the throttler
 */
export interface SolidThrottler<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
> extends Omit<
    Throttler<TFn, TArgs>,
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
 * The hook returns an object containing:
 * - maybeExecute: The throttled function that respects the configured wait time
 * - cancel: A function to cancel any pending trailing execution
 * - getExecutionCount: A function that returns the number of times the throttled function has executed
 *
 * @example
 * ```tsx
 * // Basic throttling with custom state
 * const [value, setValue] = createSignal(0);
 * const { maybeExecute } = createThrottler(setValue, { wait: 1000 });
 *
 * // With any state manager
 * const { maybeExecute, cancel } = createThrottler(
 *   (value) => stateManager.setState(value),
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 * ```
 */
export function createThrottler<
  TFn extends AnyFunction,
  TArgs extends Parameters<TFn>,
>(
  fn: TFn,
  initialOptions: ThrottlerOptions<TFn, TArgs>,
): SolidThrottler<TFn, TArgs> {
  const throttler = new Throttler<TFn, TArgs>(fn, initialOptions)

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

  function setOptions(newOptions: Partial<ThrottlerOptions<TFn, TArgs>>) {
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

  return {
    ...bindInstanceMethods(throttler),
    executionCount,
    isPending,
    lastExecutionTime,
    nextExecutionTime,
    setOptions,
  }
}
