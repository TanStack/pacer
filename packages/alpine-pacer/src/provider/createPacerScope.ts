import { createAsyncBatcher } from '../async-batcher/createAsyncBatcher'
import { createAsyncDebouncer } from '../async-debouncer/createAsyncDebouncer'
import { createAsyncQueuedState } from '../async-queuer/createAsyncQueuedState'
import { createAsyncQueuer } from '../async-queuer/createAsyncQueuer'
import { createAsyncRateLimiter } from '../async-rate-limiter/createAsyncRateLimiter'
import { createAsyncThrottler } from '../async-throttler/createAsyncThrottler'
import { createBatcher } from '../batcher/createBatcher'
import { createDebouncedState } from '../debouncer/createDebouncedState'
import { createDebouncedValue } from '../debouncer/createDebouncedValue'
import { createDebouncer } from '../debouncer/createDebouncer'
import { createQueuedState } from '../queuer/createQueuedState'
import { createQueuedValue } from '../queuer/createQueuedValue'
import { createQueuer } from '../queuer/createQueuer'
import { createRateLimitedState } from '../rate-limiter/createRateLimitedState'
import { createRateLimitedValue } from '../rate-limiter/createRateLimitedValue'
import { createRateLimiter } from '../rate-limiter/createRateLimiter'
import { createThrottledState } from '../throttler/createThrottledState'
import { createThrottledValue } from '../throttler/createThrottledValue'
import { createThrottler } from '../throttler/createThrottler'
import { createScope } from './PacerProvider'
import type { PacerProviderOptions } from './PacerProvider'
import type * as P from '../index'
import type * as C from '../utils/cell'

/** Creates typed Pacer factories sharing an Alpine lifecycle and reactive defaults. */
export function createPacerScope(
  defaultOptions: P.AlpinePacerOptions<PacerProviderOptions> = {},
) {
  const scope = createScope(defaultOptions)
  return {
    destroy: scope.destroy,
    get destroyed() {
      return scope.destroyed
    },
    createAsyncBatcher<TValue, TSelected = {}>(
      fn: (items: Array<TValue>) => Promise<any>,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncBatcherOptions<TValue, TSelected>
      > = {},
      selector: (state: P.AsyncBatcherState<TValue>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineAsyncBatcher<TValue, TSelected> {
      return createAsyncBatcher(scope, fn, options, selector)
    },
    createAsyncDebouncer<TFn extends P.AnyAsyncFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncDebouncerOptions<TFn, TSelected>
      >,
      selector: (state: P.AsyncDebouncerState<TFn>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineAsyncDebouncer<TFn, TSelected> {
      return createAsyncDebouncer(scope, fn, options, selector)
    },
    createAsyncQueuedState<
      TValue,
      TSelected extends Pick<P.AsyncQueuerState<TValue>, 'items'> = Pick<
        P.AsyncQueuerState<TValue>,
        'items'
      >,
    >(
      fn: (item: TValue) => Promise<any>,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncQueuerOptions<TValue, TSelected>
      > = {},
      selector: (state: P.AsyncQueuerState<TValue>) => TSelected = (state) =>
        ({ items: state.items }) as TSelected,
    ): [() => Array<TValue>, P.AlpineAsyncQueuer<TValue, TSelected>] {
      return createAsyncQueuedState(scope, fn, options, selector)
    },
    createAsyncQueuer<TValue, TSelected = {}>(
      fn: (item: TValue) => Promise<any>,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncQueuerOptions<TValue, TSelected>
      > = {},
      selector: (state: P.AsyncQueuerState<TValue>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineAsyncQueuer<TValue, TSelected> {
      return createAsyncQueuer(scope, fn, options, selector)
    },
    createAsyncRateLimiter<TFn extends P.AnyAsyncFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncRateLimiterOptions<TFn, TSelected>
      >,
      selector: (state: P.AsyncRateLimiterState<TFn>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineAsyncRateLimiter<TFn, TSelected> {
      return createAsyncRateLimiter(scope, fn, options, selector)
    },
    createAsyncThrottler<TFn extends P.AnyAsyncFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<
        P.AlpineAsyncThrottlerOptions<TFn, TSelected>
      >,
      selector: (state: P.AsyncThrottlerState<TFn>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineAsyncThrottler<TFn, TSelected> {
      return createAsyncThrottler(scope, fn, options, selector)
    },
    createBatcher<TValue, TSelected = {}>(
      fn: (items: Array<TValue>) => void,
      options: P.AlpinePacerOptions<
        P.AlpineBatcherOptions<TValue, TSelected>
      > = {},
      selector: (state: P.BatcherState<TValue>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineBatcher<TValue, TSelected> {
      return createBatcher(scope, fn, options, selector)
    },
    createDebouncedState<TValue, TSelected = {}>(
      initialValue: TValue,
      options: P.AlpinePacerOptions<
        P.AlpineDebouncerOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.DebouncerState<C.SetValue<TValue>>) => TSelected,
    ): [
      C.CellValue<TValue>,
      C.SetValue<TValue>,
      P.AlpineDebouncer<C.SetValue<TValue>, TSelected>,
    ] {
      return createDebouncedState(scope, initialValue, options, selector)
    },
    createDebouncedValue<TValue, TSelected = {}>(
      source: C.ValueSource<TValue>,
      options: P.AlpinePacerOptions<
        P.AlpineDebouncerOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.DebouncerState<C.SetValue<TValue>>) => TSelected,
    ): [C.CellValue<TValue>, P.AlpineDebouncer<C.SetValue<TValue>, TSelected>] {
      return createDebouncedValue(scope, source, options, selector)
    },
    createDebouncer<TFn extends P.AnyFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<P.AlpineDebouncerOptions<TFn, TSelected>>,
      selector: (state: P.DebouncerState<TFn>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineDebouncer<TFn, TSelected> {
      return createDebouncer(scope, fn, options, selector)
    },
    createQueuedState<
      TValue,
      TSelected extends Pick<P.QueuerState<TValue>, 'items'> = Pick<
        P.QueuerState<TValue>,
        'items'
      >,
    >(
      fn: (item: TValue) => void,
      options: P.AlpinePacerOptions<
        P.AlpineQueuerOptions<TValue, TSelected>
      > = {},
      selector: (state: P.QueuerState<TValue>) => TSelected = (state) =>
        ({ items: state.items }) as TSelected,
    ): [
      () => Array<TValue>,
      P.AlpineQueuer<TValue, TSelected>['addItem'],
      P.AlpineQueuer<TValue, TSelected>,
    ] {
      return createQueuedState(scope, fn, options, selector)
    },
    createQueuedValue<TValue, TSelected = {}>(
      source: C.ValueSource<TValue>,
      options: P.AlpinePacerOptions<
        P.AlpineQueuerOptions<TValue, TSelected>
      > = {},
      selector?: (state: P.QueuerState<TValue>) => TSelected,
    ): [C.CellValue<TValue>, P.AlpineQueuer<TValue, TSelected>] {
      return createQueuedValue(scope, source, options, selector)
    },
    createQueuer<TValue, TSelected = {}>(
      fn: (item: TValue) => void,
      options: P.AlpinePacerOptions<
        P.AlpineQueuerOptions<TValue, TSelected>
      > = {},
      selector: (state: P.QueuerState<TValue>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineQueuer<TValue, TSelected> {
      return createQueuer(scope, fn, options, selector)
    },
    createRateLimitedState<TValue, TSelected = {}>(
      initialValue: TValue,
      options: P.AlpinePacerOptions<
        P.AlpineRateLimiterOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.RateLimiterState) => TSelected,
    ): [
      C.CellValue<TValue>,
      C.SetValue<TValue>,
      P.AlpineRateLimiter<C.SetValue<TValue>, TSelected>,
    ] {
      return createRateLimitedState(scope, initialValue, options, selector)
    },
    createRateLimitedValue<TValue, TSelected = {}>(
      source: C.ValueSource<TValue>,
      options: P.AlpinePacerOptions<
        P.AlpineRateLimiterOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.RateLimiterState) => TSelected,
    ): [
      C.CellValue<TValue>,
      P.AlpineRateLimiter<C.SetValue<TValue>, TSelected>,
    ] {
      return createRateLimitedValue(scope, source, options, selector)
    },
    createRateLimiter<TFn extends P.AnyFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<P.AlpineRateLimiterOptions<TFn, TSelected>>,
      selector: (state: P.RateLimiterState) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineRateLimiter<TFn, TSelected> {
      return createRateLimiter(scope, fn, options, selector)
    },
    createThrottledState<TValue, TSelected = {}>(
      initialValue: TValue,
      options: P.AlpinePacerOptions<
        P.AlpineThrottlerOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.ThrottlerState<C.SetValue<TValue>>) => TSelected,
    ): [
      C.CellValue<TValue>,
      C.SetValue<TValue>,
      P.AlpineThrottler<C.SetValue<TValue>, TSelected>,
    ] {
      return createThrottledState(scope, initialValue, options, selector)
    },
    createThrottledValue<TValue, TSelected = {}>(
      source: C.ValueSource<TValue>,
      options: P.AlpinePacerOptions<
        P.AlpineThrottlerOptions<C.SetValue<TValue>, TSelected>
      >,
      selector?: (state: P.ThrottlerState<C.SetValue<TValue>>) => TSelected,
    ): [C.CellValue<TValue>, P.AlpineThrottler<C.SetValue<TValue>, TSelected>] {
      return createThrottledValue(scope, source, options, selector)
    },
    createThrottler<TFn extends P.AnyFunction, TSelected = {}>(
      fn: TFn,
      options: P.AlpinePacerOptions<P.AlpineThrottlerOptions<TFn, TSelected>>,
      selector: (state: P.ThrottlerState<TFn>) => TSelected = () =>
        ({}) as TSelected,
    ): P.AlpineThrottler<TFn, TSelected> {
      return createThrottler(scope, fn, options, selector)
    },
  }
}
