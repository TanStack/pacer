import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { Queuer } from '@tanstack/pacer/queuer'
import { injectOutsideZone } from '../utils/injectOutsideZone'
import { injectPendingTask } from '../utils/injectPendingTask'
import { injectExternalStore } from '../utils/injectExternalStore'
import { injectPacerOptions } from '../provider/pacer-context'
import type { AngularPacerOptions } from '../types'
import type { Signal } from '@angular/core'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface AngularQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /**
   * Optional callback invoked when the component is destroyed. Receives the queuer instance.
   * When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.
   */
  onUnmount?: (queuer: AngularQueuer<TValue, TSelected>) => void
}

export interface AngularQueuer<TValue, TSelected = {}> extends Pick<
  Queuer<TValue>,
  | 'addItem'
  | 'getNextItem'
  | 'execute'
  | 'flush'
  | 'flushAsBatch'
  | 'peekNextItem'
  | 'peekAllItems'
  | 'start'
  | 'stop'
  | 'clear'
  | 'reset'
> {
  readonly key: Signal<Queuer<TValue>['key']>
  readonly fn: Signal<Queuer<TValue>['fn']>
  readonly options: Signal<
    Queuer<TValue>['options'] & AngularQueuerOptions<TValue, TSelected>
  >
  /** Core store access; use state() for reactive selected state. */
  readonly store: Signal<Queuer<TValue>['store']>
  readonly state: Signal<Readonly<TSelected>>
  setOptions: (
    options: Partial<AngularQueuerOptions<TValue, TSelected>>,
  ) => void
}

/**
 * An Angular function that creates and manages a Queuer instance.
 *
 * This is a lower-level function that provides direct access to the Queuer's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The Queuer processes items synchronously in order, with optional delays between processing each item.
 * The queuer includes an internal tick mechanism that can be started and stopped, making it useful as a scheduler.
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
 * @example
 * ```ts
 * // Default selected state is an empty object
 * const queue = injectQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 }
 * );
 *
 * // Opt-in to track queue contents changes
 * const queue = injectQueuer(
 *   (item) => console.log('Processing:', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({ items: state.items, size: state.size })
 * );
 *
 * // Add items
 * queue.addItem('task1');
 *
 * // Access the selected state
 * const { items, isRunning } = queue.state();
 * ```
 *
 * ## Cleanup on Destroy
 *
 * By default, the function stops the queuer when the component is destroyed.
 * Use the `onUnmount` option to customize this. For example, to flush pending items instead:
 *
 * ```ts
 * const queue = injectQueuer(fn, {
 *   started: true,
 *   onUnmount: (q) => q.flush()
 * });
 * ```
 */
export function injectQueuer<TValue, TSelected>(
  fn: (item: TValue) => void,
  options: AngularPacerOptions<AngularQueuerOptions<TValue, TSelected>>,
  selector: (state: QueuerState<TValue>) => TSelected,
): AngularQueuer<TValue, TSelected>
export function injectQueuer<TValue>(
  fn: (item: TValue) => void,
  options?: AngularPacerOptions<AngularQueuerOptions<TValue, {}>>,
  selector?: undefined,
): AngularQueuer<TValue, {}>
export function injectQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options?: AngularPacerOptions<AngularQueuerOptions<TValue, TSelected | {}>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): AngularQueuer<TValue, TSelected | {}>
export function injectQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options?: AngularPacerOptions<AngularQueuerOptions<TValue, TSelected | {}>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): AngularQueuer<TValue, TSelected | {}> {
  const owner = inject(DestroyRef)
  const defaults = injectPacerOptions()
  const outsideZone = injectOutsideZone()
  const pending = injectPendingTask()
  const resolvedOptions = linkedSignal(() => ({
    ...defaults.queuer,
    ...(typeof options === 'function' ? options() : options),
  }))
  const instance = computed(() =>
    untracked(() =>
      outsideZone(() => {
        const initialOptions = resolvedOptions()
        const value = new Queuer<TValue>(fn, {
          ...initialOptions,
          // Defer callbacks and processing to the owned startup boundary.
          initialItems: [],
          initialState: {
            ...initialOptions.initialState,
            isRunning: false,
            pendingTick: false,
          },
        })
        // Expose the actual configuration, rather than inert-construction settings.
        value.options.initialItems = initialOptions.initialItems ?? []
        value.options.initialState = initialOptions.initialState
        return { value, initialOptions }
      }),
    ),
  )

  // The effect owns normal disposal; an early operation temporarily owns its resource.
  let effectOwnsInstance = false
  let unregisterEarlyCleanup: (() => void) | undefined
  let initialized = false
  const cleanup = (current: Queuer<TValue>) => {
    const onUnmount = (
      current.options as AngularQueuerOptions<TValue, TSelected | {}>
    ).onUnmount
    if (onUnmount) onUnmount(result)
    else {
      current.stop()
    }
  }

  function run(): void
  function run<T>(operation: (current: Queuer<TValue>) => T): T
  function run<T>(operation?: (current: Queuer<TValue>) => T): T | undefined {
    return outsideZone(() =>
      untracked(() => {
        const latest = resolvedOptions()
        const current = instance().value
        current.setOptions(latest)
        if (!effectOwnsInstance && !unregisterEarlyCleanup) {
          unregisterEarlyCleanup = owner.onDestroy(() =>
            outsideZone(() => untracked(() => cleanup(current))),
          )
        }
        try {
          if (!initialized) {
            initialized = true
            const initialOptions = instance().initialOptions
            if (
              instance().initialOptions.initialState?.isRunning ??
              instance().initialOptions.started ??
              true
            )
              current.start()
            if (!initialOptions.initialState?.items) {
              const items = initialOptions.initialItems ?? []
              for (let index = 0; index < items.length; index++) {
                current.addItem(
                  items[index],
                  initialOptions.addItemsTo ?? 'back',
                  index === items.length - 1,
                )
              }
            }
          }
          return operation?.(current)
        } finally {
          pending.set(
            current.store.state.isRunning &&
              current.store.state.items.length > 0,
          )
        }
      }),
    )
  }

  // Read only identity here: option changes must not dispose the stable instance.
  effect((onCleanup) => {
    const current = instance().value
    effectOwnsInstance = true
    unregisterEarlyCleanup?.()
    unregisterEarlyCleanup = undefined
    onCleanup(() => outsideZone(() => untracked(() => cleanup(current))))
    run()
  })

  effect(() => {
    const current = instance().value
    const latest = resolvedOptions()
    outsideZone(() =>
      untracked(() => {
        current.setOptions(latest)
      }),
    )
  })

  const snapshot = injectExternalStore(() => {
    const current = instance().value
    return {
      getSnapshot: () => current.store.state,
      subscribe: (notify) => {
        const { unsubscribe } = current.store.subscribe(notify)
        return unsubscribe
      },
    }
  })

  const state = computed(() => (selector ? selector(snapshot()) : {}))
  effect(() => pending.set(snapshot().isRunning && snapshot().items.length > 0))

  const result: AngularQueuer<TValue, TSelected | {}> = {
    key: computed(() => instance().value.key),
    fn: computed(() => fn),
    options: computed(() => {
      const latest = resolvedOptions()
      return { ...instance().value.options, ...latest }
    }),
    store: computed(() => instance().value.store),
    state,
    setOptions: (update) =>
      untracked(() => {
        resolvedOptions.update((previous) => ({ ...previous, ...update }))
        run()
      }),
    addItem: (...args) => run((current) => current.addItem(...args)),
    getNextItem: (...args) => run((current) => current.getNextItem(...args)),
    execute: (...args) => run((current) => current.execute(...args)),
    flush: (...args) => run((current) => current.flush(...args)),
    flushAsBatch: (...args) => run((current) => current.flushAsBatch(...args)),
    peekNextItem: (...args) => run((current) => current.peekNextItem(...args)),
    peekAllItems: (...args) => run((current) => current.peekAllItems(...args)),
    start: (...args) => run((current) => current.start(...args)),
    stop: (...args) => run((current) => current.stop(...args)),
    clear: (...args) => run((current) => current.clear(...args)),
    reset: (...args) => run((current) => current.reset(...args)),
  }
  return result
}
