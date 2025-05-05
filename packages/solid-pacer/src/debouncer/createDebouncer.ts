import { Debouncer } from '@tanstack/pacer/debouncer'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { bindInstanceMethods } from '@tanstack/pacer/utils'
import type { Accessor } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type { DebouncerOptions } from '@tanstack/pacer/debouncer'

/**
 * An extension of the Debouncer class that adds Solid signals to access the internal state of the debouncer
 */
export interface SolidDebouncer<TFn extends AnyFunction>
  extends Omit<Debouncer<TFn>, 'getExecutionCount' | 'getIsPending'> {
  executionCount: Accessor<number>
  isPending: Accessor<boolean>
}

/**
 * A Solid hook that creates and manages a Debouncer instance.
 *
 * This is a lower-level hook that provides direct access to the Debouncer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (createSignal, Redux, Zustand, etc.).
 *
 * This hook provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
 *
 * @example
 * ```tsx
 * // Debounce a search function to limit API calls
 * const debouncer = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 } // Wait 500ms after last keystroke
 * );
 *
 * // In an event handler
 * const handleChange = (e) => {
 *   debouncer.maybeExecute(e.target.value);
 * };
 *
 * // Access debouncer state via signals
 * console.log('Executions:', debouncer.executionCount());
 * console.log('Is pending:', debouncer.isPending());
 *
 * // Update options
 * debouncer.setOptions({ wait: 1000 });
 * ```
 */
export function createDebouncer<TFn extends AnyFunction>(
  fn: TFn,
  initialOptions: DebouncerOptions<TFn>,
): SolidDebouncer<TFn> {
  const debouncer = bindInstanceMethods(new Debouncer<TFn>(fn, initialOptions))

  const [executionCount, setExecutionCount] = createSignal(
    debouncer.getExecutionCount(),
  )
  const [isPending, setIsPending] = createSignal(debouncer.getIsPending())

  function setOptions(newOptions: Partial<DebouncerOptions<TFn>>) {
    debouncer.setOptions({
      ...newOptions,
      onExecute: (debouncer) => {
        setExecutionCount(debouncer.getExecutionCount())
        setIsPending(debouncer.getIsPending())

        const onExecute = newOptions.onExecute ?? initialOptions.onExecute
        onExecute?.(debouncer)
      },
    })
  }

  setOptions(initialOptions)

  createEffect(() => {
    onCleanup(() => {
      debouncer.cancel()
    })
  })

  return {
    ...debouncer,
    executionCount,
    isPending,
    setOptions,
  } as SolidDebouncer<TFn>
}
