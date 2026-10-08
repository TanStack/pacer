import { computed, effect, untracked } from '@angular/core'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
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
import type {
  AnyAsyncFunction,
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer'
import type { MethodKeys } from '../utils/injectForwardMethods'

/**
 * Options for {@link injectAsyncRateLimiter}, including core configuration and Angular cleanup.
 */
export interface AngularAsyncRateLimiterOptions<
  TFn extends AnyAsyncFunction,
> extends AsyncRateLimiterOptions<TFn> {
  /**
   * Called when the owning injection context is destroyed. Receives the core instance.
   * Providing this callback replaces the default cleanup (abort running work and reset the limiter).
   */
  onUnmount?: (core: AsyncRateLimiter<TFn>) => void
}

const asyncRateLimiterMethods = [
  'maybeExecute',
  'getRemainingInWindow',
  'getMsUntilNextWindow',
  'abort',
  'reset',
  'getAbortSignal',
] as const satisfies ReadonlyArray<
  MethodKeys<AsyncRateLimiter<AnyAsyncFunction>>
>

type AsyncRateLimiterMethod = (typeof asyncRateLimiterMethods)[number]

/**
 * An Angular AsyncRateLimiter ref with stable core methods and readonly selected state.
 * Read `state()` to observe the selector result; without a selector it returns `{}`.
 */
export interface AngularAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Pick<AsyncRateLimiter<TFn>, AsyncRateLimiterMethod> {
  /** The readonly selector result. Returns an empty object when no selector is supplied. */
  readonly state: Signal<ReadonlySelected<TSelected>>
}

/**
 * Creates and manages an Angular AsyncRateLimiter in the current injection context.
 *
 * Allows asynchronous calls up to the configured limit within a fixed or sliding window. Calls beyond the limit are rejected rather than queued.
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
 * The default cleanup is to abort running work and reset the limiter. Set `onUnmount` to replace it.
 *
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive factory returning them.
 * @returns A ref containing stable methods and a readonly selected-state signal.
 *
 * @example
 * ```ts
 * // In a component or service injection context.
 * const utility = injectAsyncRateLimiter(
 *   (query: string) => Promise.resolve(query),
 *   () => ({ limit: 5, window: 1000 }),
 *   (state) => state.isExecuting,
 * )
 * utility.maybeExecute('search')
 * console.log(utility.state())
 * ```
 */
export function injectAsyncRateLimiter<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncRateLimiterOptions<TFn>>,
): AngularAsyncRateLimiter<TFn>
/**
 * Creates an Angular AsyncRateLimiter with a reactive selector result.
 * @param fn The callback invoked by the core utility.
 * @param options Core options or a reactive options factory.
 * @param selector Selects the state exposed by the returned `state` signal.
 * @returns The utility ref with the selected state.
 */
export function injectAsyncRateLimiter<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncRateLimiterOptions<TFn>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected,
): AngularAsyncRateLimiter<TFn, TSelected>
export function injectAsyncRateLimiter<TFn extends AnyAsyncFunction, TSelected>(
  fn: TFn,
  options: MaybeAccessor<AngularAsyncRateLimiterOptions<TFn>>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected | {} = () => ({}),
): AngularAsyncRateLimiter<TFn, TSelected | {}> {
  const baseOptions = injectPacerOptions()
  const optionsSignal = toAccessorSignal(options)
  const mergedOptions = computed<AngularAsyncRateLimiterOptions<TFn>>(() => ({
    ...baseOptions.asyncRateLimiter,
    ...optionsSignal(),
  }))

  const asyncRateLimiterSignal = injectLazy(
    () => new AsyncRateLimiter<TFn>(fn, mergedOptions()),
  )

  const methods = injectForwardMethods(
    asyncRateLimiterSignal,
    asyncRateLimiterMethods,
    (core) => {
      core.setOptions(mergedOptions())
    },
  )

  effect(() => {
    const opts = mergedOptions()
    untracked(() => asyncRateLimiterSignal().setOptions(opts))
  })

  effect((onCleanup) => {
    const core = asyncRateLimiterSignal()
    onCleanup(() => {
      const opts = untracked(mergedOptions)
      if (opts.onUnmount) {
        opts.onUnmount(core)
      } else {
        core.abort()
        core.reset()
      }
    })
  })

  const hasPendingTasks = injectSelector(
    () => asyncRateLimiterSignal().store,
    (state) => state.isExecuting,
  )
  injectPendingTasksLifecycle(hasPendingTasks)

  const state = injectSelector(() => asyncRateLimiterSignal().store, selector, {
    compare: shallow,
  })

  return { state, ...methods }
}
