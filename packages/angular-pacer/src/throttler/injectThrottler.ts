import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { Throttler } from '@tanstack/pacer/throttler'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

export interface AngularThrottlerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends ThrottlerOptions<TFn> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the throttler instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (throttler: AngularThrottler<TFn, TSelected>) => void
}

export interface AngularThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Pick<Throttler<TFn>, 'maybeExecute' | 'flush' | 'cancel' | 'reset'> {
  readonly key: Signal<Throttler<TFn>['key']>
  readonly fn: Signal<Throttler<TFn>['fn']>
  readonly options: Signal<
    Throttler<TFn>['options'] & AngularThrottlerOptions<TFn, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<Throttler<TFn>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularThrottlerOptions<TFn, TSelected>>,
  ) => void
}

/**
 * An Angular function that creates and manages a Throttler instance.
 *
 * This is a lower-level function that provides direct access to the Throttler's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * This function provides throttling functionality to limit how often a function can be called,
 * ensuring it executes at most once within a specified time window.
 *
 * The throttler will execute the function immediately (if leading is enabled) and then
 * prevent further executions until the wait period has elapsed.
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
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last execution
 * - `nextExecutionTime`: Timestamp of the next allowed execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * ## Cleanup on Destroy
 *
 * By default, the function cancels any pending execution when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```ts
 * const throttler = injectThrottler(fn, {
 *   wait: 100,
 *   onUnmount: (t) => t.flush()
 * });
 * ```
 *
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const throttler = injectThrottler(
 *   (scrollY: number) => updateScrollPosition(scrollY),
 *   { wait: 100 }
 * );
 *
 * // Opt-in to track isPending changes (optimized for loading states)
 * const throttler = injectThrottler(
 *   (scrollY: number) => updateScrollPosition(scrollY),
 *   { wait: 100 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // In an event handler
 * window.addEventListener('scroll', () => {
 *   throttler.maybeExecute(window.scrollY);
 * });
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending } = throttler.state();
 * ```
 */
export function injectThrottler<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: AngularPacerOptions<AngularThrottlerOptions<TFn, TSelected>>,
  selector: (state: ThrottlerState<TFn>) => TSelected,
): AngularThrottler<TFn, TSelected>
export function injectThrottler<TFn extends AnyFunction>(
  fn: TFn,
  options: AngularPacerOptions<AngularThrottlerOptions<TFn, {}>>,
  selector?: undefined,
): AngularThrottler<TFn, {}>
export function injectThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularThrottlerOptions<TFn, TSelected | {}>>,
  selector?: (state: ThrottlerState<TFn>) => TSelected,
): AngularThrottler<TFn, TSelected | {}>
export function injectThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: AngularPacerOptions<AngularThrottlerOptions<TFn, TSelected | {}>>,
  selector?: (state: ThrottlerState<TFn>) => TSelected,
): AngularThrottler<TFn, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.throttler,
    ...(typeof options === 'function' ? options() : options),
  }))
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        return new Throttler<TFn>(fn, initialOptions)
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  const cleanup = (current: Throttler<TFn>) => {
    const onUnmount = (
      current.options as AngularThrottlerOptions<TFn, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.cancel()
    }
  }

  function run(): void
  function run<T>(operation: (current: Throttler<TFn>) => T): T
  function run<T>(operation?: (current: Throttler<TFn>) => T): T | undefined {
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
          pending.set(current.store.state.isPending)
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

  const state = computed(() => (selector ? selector(snapshot()) : {}))
  effect(() => pending.set(snapshot().isPending))

  const result: AngularThrottler<TFn, TSelected | {}> = {
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
  }
  return result
}
