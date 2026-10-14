import {
  assertInInjectionContext,
  computed,
  effect,
  untracked,
} from '@angular/core'
import { Queuer } from '@tanstack/pacer/queuer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectInsideZone } from '../utils/zoneCompatibility'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { MethodMap } from '../utils/injectForwardMethods'
import type { ReadonlySelected } from '../utils/internalTypes'
import type { Signal } from '@angular/core'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer'

/**
 * Options for {@link injectQueuer}, including core configuration and Angular cleanup.
 */
export interface AngularQueuerOptions<TValue> extends QueuerOptions<TValue> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (stop automatic processing).
   */
  onUnmount?: (core: Queuer<TValue>) => void
}

const queuerMethodMap = {
  fn: false,
  setOptions: false,
  addItem: true,
  getNextItem: true,
  execute: true,
  flush: true,
  flushAsBatch: true,
  peekNextItem: true,
  peekAllItems: true,
  start: true,
  stop: true,
  clear: true,
  reset: true,
} satisfies MethodMap<Queuer<unknown>>

const queuerMethods = methodNames(queuerMethodMap)

type QueuerMethod = (typeof queuerMethods)[number]

/**
 * An Angular Queuer ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularQueuer<TValue, TSelected = {}> extends Pick<
  Queuer<TValue>,
  QueuerMethod
> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular Queuer in the current injection context.
 *
 * Processes queued items in order with configurable pacing, capacity, and priority.
 *
 * ## Options and state
 *
 * Accepts static options or an options factory. Factories are read lazily, and signal
 * dependencies update the existing core instance. Local options override provider defaults.
 * Methods apply current options before executing and schedule work outside Angular's zone. The provided function runs inside Angular's zone.
 *
 * Pass a selector to expose reactive core state through `state()`. Without a selector,
 * `state()` returns `{}`; operations remain available on the ref.
 *
 * ## Cleanup
 *
 * The default cleanup is to stop automatic processing. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectQueuer(
 *   (item: string) => console.log(item),
 *   () => ({ wait: 100 }),
 *   (state) => state.items,
 * )
 * utility.addItem('job')
 * console.log(utility.state())
 * ```
 */
export function injectQueuer<TValue>(
  fn: (item: TValue) => void,
  options?: MaybeAccessor<AngularQueuerOptions<TValue>>,
): AngularQueuer<TValue>
/**
 * Creates an Angular Queuer with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectQueuer<TValue, TSelected>(
  fn: (item: TValue) => void,
  options: MaybeAccessor<AngularQueuerOptions<TValue>>,
  selector: (state: QueuerState<TValue>) => TSelected,
): AngularQueuer<TValue, TSelected>
export function injectQueuer<TValue, TSelected>(
  fn: (item: TValue) => void,
  options: MaybeAccessor<AngularQueuerOptions<TValue>> = {},
  selector: (state: QueuerState<TValue>) => TSelected | {} = () => ({}),
): AngularQueuer<TValue, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectQueuer)
  }

  const runFn = injectInsideZone(fn)
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed(() => ({
    ...baseOptions.queuer,
    ...optionsSignal(),
  }))

  const getQueuer = injectLazy(
    () => new Queuer<TValue>(runFn, mergedOptions()),
    (core) => {
      const opts = mergedOptions()
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.stop()
      }
    },
  )

  const methods = injectForwardMethods(getQueuer, queuerMethods, (core) => {
    core.setOptions(mergedOptions())
  })

  effect(() => {
    const opts = mergedOptions()
    untracked(() => getQueuer().setOptions(opts))
  })

  const hasPendingTasks = injectSelector(
    () => getQueuer().store,
    (state) => state.isRunning && state.pendingTick,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => getQueuer().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
