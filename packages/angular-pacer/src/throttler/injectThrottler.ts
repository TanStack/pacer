import { computed, effect, untracked } from '@angular/core'
import { Throttler } from '@tanstack/pacer/throttler'
import { shallow } from '@tanstack/store'
import { injectPacerOptions } from '../provider/providePacerOptions'
import { toAccessorSignal } from '../utils/maybeAccessor'
import {
  injectForwardMethods,
  methodNames,
} from '../utils/injectForwardMethods'
import { injectLazy } from '../utils/injectLazy'
import { injectSelector } from '../utils/injectSelector'
import { injectPendingTasksLifecycle } from '../utils/injectPendingTasksLifecycle'
import type { ReadonlySelected } from '../utils/readonlySelected'
import type { MaybeAccessor } from '../utils/maybeAccessor'
import type { Signal } from '@angular/core'
import type {
  AnyFunction,
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer'
import type { MethodMap } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectThrottler}, including core configuration and Angular cleanup.
 */
export interface AngularThrottlerOptions<
  TFn extends AnyFunction,
> extends ThrottlerOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending execution).
   */
  onUnmount?: (core: Throttler<TFn>) => void
}

const throttlerMethodMap = {
  fn: false,
  setOptions: false,
  maybeExecute: true,
  flush: true,
  cancel: true,
  reset: true,
} satisfies MethodMap<Throttler<AnyFunction>>

const throttlerMethods = methodNames(throttlerMethodMap)

type ThrottlerMethod = (typeof throttlerMethods)[number]

/**
 * An Angular Throttler ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularThrottler<
  TFn extends AnyFunction,
  TSelected = {},
> extends Pick<Throttler<TFn>, ThrottlerMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular Throttler in the current injection context.
 *
 * Limits executions to the configured interval, with leading and trailing calls. Later calls replace the pending trailing arguments without restarting the interval.
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
 * The default cleanup is to cancel pending execution. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectThrottler(
 *   (value: number) => console.log(value),
 *   () => ({ wait: 100 }),
 *   (state) => state.isPending,
 * )
 * utility.maybeExecute(42)
 * console.log(utility.state())
 * ```
 */
export function injectThrottler<TFn extends AnyFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularThrottlerOptions<TFn>>,
): AngularThrottler<TFn>
/**
 * Creates an Angular Throttler with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectThrottler<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularThrottlerOptions<TFn>>,
  selector: (state: ThrottlerState<TFn>) => TSelected,
): AngularThrottler<TFn, TSelected>
export function injectThrottler<TFn extends AnyFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularThrottlerOptions<TFn>>,
  selector: (state: ThrottlerState<TFn>) => TSelected | {} = () => ({}),
): AngularThrottler<TFn, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularThrottlerOptions<TFn>>(() => ({
    ...baseOptions.throttler,
    ...optionsSignal(),
  }))

  const throttlerSignal = injectLazy(
    () => new Throttler<TFn>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    throttlerSignal,
    throttlerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => throttlerSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = throttlerSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => throttlerSignal().store,
    (state) => state.isPending,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => throttlerSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
