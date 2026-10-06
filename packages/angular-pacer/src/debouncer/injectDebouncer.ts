import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { shallow } from '@tanstack/angular-store'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

export interface AngularDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the debouncer instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (debouncer: AngularDebouncer<TFn, TSelected>) => void
}

export interface AngularDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Pick<
  Debouncer<TFn>,
  'maybeExecute' | 'flush' | 'cancel' | 'reset' | 'getIsScheduled'
> {
  readonly key: Signal<Debouncer<TFn>['key']>
  readonly fn: Signal<Debouncer<TFn>['fn']>
  readonly options: Signal<
    Debouncer<TFn>['options'] & AngularDebouncerOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<Debouncer<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularDebouncerOptions<TFn, TSelected>>,
  ) => void
}

/**
 * An Angular function that creates and manages a Debouncer instance.
 *
 * This is a lower-level function that provides direct access to the Debouncer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
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
 * By default, the selected state is an empty object. Provide a selector to expose
 * reactive state fields. The adapter observes core work separately for Angular stability.
 *
 * Available state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * ## Cleanup on Destroy
 *
 * By default, the function cancels any pending execution when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const debouncer = injectDebouncer(fn, {
 *   wait: 500,
 *   onUnmount: (d) => d.flush()
 * });
 * ```
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const debouncer = injectDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isPending changes (optimized for loading states)
 * const debouncer = injectDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // In an event handler
 * const handleChange = (e: Event) => {
 *   const target = e.target as HTMLInputElement
 *   debouncer.maybeExecute(target.value);
 * };
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending } = debouncer.state();
 * ```
 */
export function injectDebouncer<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularDebouncerOptions<TFn, TSelected>>,
  selector: (state: DebouncerState<TFn>) => TSelected,
): AngularDebouncer<TFn, TSelected>
export function injectDebouncer<TFn extends AnyFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularDebouncerOptions<TFn, {}>>,
  selector?: undefined,
): AngularDebouncer<TFn, {}>
export function injectDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularDebouncerOptions<TFn, TSelected | {}>>,
  selector?: (state: DebouncerState<TFn>) => TSelected,
): AngularDebouncer<TFn, TSelected | {}>
export function injectDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularDebouncerOptions<TFn, TSelected | {}>>,
  selector?: (state: DebouncerState<TFn>) => TSelected,
): AngularDebouncer<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal<
    AngularDebouncerOptions<TFn, TSelected | {}>
  >(() => ({
    ...defaults.debouncer,
    ...(typeof options === 'function' ? options() : options),
  }))
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new Debouncer<TFn>(fn, initialOptions)
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: Debouncer<TFn>) => {
    const onUnmount = {
      ...current.options,
      ...resolvedOptions(),
    }.onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
    }
  }

  function run(): void
  function run<T>(operation: (current: Debouncer<TFn>) => T): T
  function run<T>(operation?: (current: Debouncer<TFn>) => T): T | undefined {
    return outsideZone(() =>
      untracked(() => {
        const latest = resolvedOptions()
        const current = instance()
        if (!effectOwnsInstance && !unregisterEarlyCleanup) {
          unregisterEarlyCleanup = owner.onDestroy(() =>
            outsideZone(() => untracked(() => cleanup(current))),
          )
        }
        current.setOptions(latest)
        try {
          return operation?.(current)
        } finally {
          pending.set(current.getIsScheduled())
        }
      }),
    )
  }

  // Read only identity here: option changes must not dispose the stable instance.
  effect((onCleanup) => {
    const current = instance()
    effectOwnsInstance = true
    unregisterEarlyCleanup?.()
    unregisterEarlyCleanup = undefined
    onCleanup(() => outsideZone(() => untracked(() => cleanup(current))))
  })

  effect(() => {
    const current = instance()
    const latest = resolvedOptions()
    outsideZone(() =>
      untracked(() => {
        current.setOptions(latest)
        pending.set(current.getIsScheduled())
      }),
    )
  })

  const snapshot = injectExternalStore(() => {
    const current = instance()
    return {
      getSnapshot: () => current.store.state,
      subscribe: (notify) => {
        const { unsubscribe } = current.store.subscribe(notify)
        return unsubscribe
      },
    }
  })

  const state = computed(() => (selector ? selector(snapshot()) : {}), {
    equal: shallow,
  })
  effect(() => {
    snapshot()
    pending.set(instance().getIsScheduled())
  })

  const result: AngularDebouncer<TFn, TSelected | {}> = {
    key: computed(() => instance().key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().options, ...latest }
    }),
    store: computed(() => instance().store),
    state,
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    maybeExecute: (...args) => run((current) => current.maybeExecute(...args)),
    flush: (...args) => run((current) => current.flush(...args)),
    cancel: (...args) => run((current) => current.cancel(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
    getIsScheduled: () => run((current) => current.getIsScheduled()),
  }
  return result
}
