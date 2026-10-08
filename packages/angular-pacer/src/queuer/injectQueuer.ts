import { computed, effect, untracked } from '@angular/core'
import { Queuer } from '@tanstack/pacer/queuer'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import { injectForwardMethods } from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer'
import type { MethodKeys } from '../utils/injectForwardMethods'

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

const queuerMethods = [
  'addItem',
  'getNextItem',
  'execute',
  'flush',
  'flushAsBatch',
  'peekNextItem',
  'peekAllItems',
  'start',
  'stop',
  'clear',
  'reset',
] as const satisfies ReadonlyArray<MethodKeys<Queuer<unknown>>>

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
 * Methods apply current options before executing and run outside Angular's zone.
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
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed(() => ({
    ...baseOptions.queuer,
    ...optionsSignal(),
  }))

  const queuerSignal = injectLazy(() => new Queuer<TValue>(fn, mergedOptions()))

  const methods = injectForwardMethods(queuerSignal, queuerMethods, (core) => {
    core.setOptions(mergedOptions())
  })

  effect(() => {
    const opts = mergedOptions()
    untracked(() => queuerSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = queuerSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.stop()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => queuerSignal().store,
    (state) => state.isRunning && state.pendingTick,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => queuerSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
