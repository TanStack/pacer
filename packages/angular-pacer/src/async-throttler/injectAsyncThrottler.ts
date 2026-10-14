import {
  assertInInjectionContext,
  computed,
  effect,
  untracked,
} from '@angular/core'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
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
import type {
  AnyAsyncFunction,
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer'

/**
 * Options for {@link injectAsyncThrottler}, including core configuration and Angular cleanup.
 */
export interface AngularAsyncThrottlerOptions<
  TFn extends AnyAsyncFunction,
> extends AsyncThrottlerOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (cancel pending execution and abort running work).
   */
  onUnmount?: (core: AsyncThrottler<TFn>) => void
}

const asyncThrottlerMethodMap = {
  fn: false,
  setOptions: false,
  maybeExecute: true,
  flush: true,
  cancel: true,
  abort: true,
  reset: true,
  getAbortSignal: true,
} satisfies MethodMap<AsyncThrottler<AnyAsyncFunction>>

const asyncThrottlerMethods = methodNames(asyncThrottlerMethodMap)

type AsyncThrottlerMethod = (typeof asyncThrottlerMethods)[number]

/**
 * An Angular AsyncThrottler ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularAsyncThrottler<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<AsyncThrottler<TFn>, AsyncThrottlerMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular AsyncThrottler in the current injection context.
 *
 * Limits asynchronous executions to the configured interval, with leading and trailing calls. Later calls replace the pending trailing arguments without restarting the interval.
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
 * The default cleanup is to cancel pending execution and abort running work. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectAsyncThrottler(
 *   (value: number) => Promise.resolve(value),
 *   () => ({ wait: 100 }),
 *   (state) => state.isPending,
 * )
 * utility.maybeExecute(42)
 * console.log(utility.state())
 * ```
 */
export function injectAsyncThrottler<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncThrottlerOptions<TFn>>,
): AngularAsyncThrottler<TFn>
/**
 * Creates an Angular AsyncThrottler with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectAsyncThrottler<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncThrottlerOptions<TFn>>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected,
): AngularAsyncThrottler<TFn, TSelected>
export function injectAsyncThrottler<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncThrottlerOptions<TFn>>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected | {} = () => ({}),
): AngularAsyncThrottler<TFn, TSelected | {}> {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    assertInInjectionContext(injectAsyncThrottler)
  }

  const runFn = injectInsideZone(fn)
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularAsyncThrottlerOptions<TFn>>(() => ({
    ...baseOptions.asyncThrottler,
    ...optionsSignal(),
  }))

  const getAsyncThrottler = injectLazy(
    () => new AsyncThrottler<TFn>(runFn, mergedOptions()),
    (core) => {
      const opts = mergedOptions()
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.cancel()
        core.abort()
      }
    },
  )

  const methods = injectForwardMethods(
    getAsyncThrottler,
    asyncThrottlerMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => getAsyncThrottler().setOptions(opts))
  })

  const hasPendingTasks = injectSelector(
    () => getAsyncThrottler().store,
    (state) => state.isPending || state.isExecuting,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => getAsyncThrottler().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
