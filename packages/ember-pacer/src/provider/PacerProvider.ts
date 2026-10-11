import { UseDebouncedValue } from '../debouncer/useDebouncedValue'
import { UseDebouncedState } from '../debouncer/useDebouncedState'
import { UseRateLimitedValue } from '../rate-limiter/useRateLimitedValue'
import { UseRateLimitedState } from '../rate-limiter/useRateLimitedState'
import { UseQueuedValue } from '../queuer/useQueuedValue'
import { UseQueuedState } from '../queuer/useQueuedState'
import { UseAsyncQueuedState } from '../async-queuer/useAsyncQueuedState'
import { UseThrottledValue } from '../throttler/useThrottledValue'
import { UseThrottledState } from '../throttler/useThrottledState'
import { UseAsyncBatcher } from '../async-batcher/useAsyncBatcher'
import { UseAsyncDebouncer } from '../async-debouncer/useAsyncDebouncer'
import { UseAsyncQueuer } from '../async-queuer/useAsyncQueuer'
import { UseAsyncRateLimiter } from '../async-rate-limiter/useAsyncRateLimiter'
import { UseAsyncThrottler } from '../async-throttler/useAsyncThrottler'
import { UseBatcher } from '../batcher/useBatcher'
import { UseDebouncer } from '../debouncer/useDebouncer'
import { UseQueuer } from '../queuer/useQueuer'
import { UseRateLimiter } from '../rate-limiter/useRateLimiter'
import { UseThrottler } from '../throttler/useThrottler'
import type {
  AnyAsyncFunction,
  AnyFunction,
  AsyncQueuerState,
  QueuerState,
} from '@tanstack/pacer'
import type { EmberPacerOptions } from '../types'
import type { EmberAsyncBatcherOptions } from '../async-batcher/useAsyncBatcher'
import type { EmberAsyncDebouncerOptions } from '../async-debouncer/useAsyncDebouncer'
import type { EmberAsyncQueuerOptions } from '../async-queuer/useAsyncQueuer'
import type { EmberAsyncRateLimiterOptions } from '../async-rate-limiter/useAsyncRateLimiter'
import type { EmberAsyncThrottlerOptions } from '../async-throttler/useAsyncThrottler'
import type { EmberBatcherOptions } from '../batcher/useBatcher'
import type { EmberDebouncerOptions } from '../debouncer/useDebouncer'
import type { EmberQueuerOptions } from '../queuer/useQueuer'
import type { EmberRateLimiterOptions } from '../rate-limiter/useRateLimiter'
import type { EmberThrottlerOptions } from '../throttler/useThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<EmberAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<EmberAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<EmberAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<EmberAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<EmberAsyncThrottlerOptions<any, any>>
  batcher?: Partial<EmberBatcherOptions<any, any>>
  debouncer?: Partial<EmberDebouncerOptions<any, any>>
  queuer?: Partial<EmberQueuerOptions<any, any>>
  rateLimiter?: Partial<EmberRateLimiterOptions<any, any>>
  throttler?: Partial<EmberThrottlerOptions<any, any>>
}

export interface EmberPacerScope {
  useDebouncedValue: typeof UseDebouncedValue
  useDebouncedState: typeof UseDebouncedState
  useRateLimitedValue: typeof UseRateLimitedValue
  useRateLimitedState: typeof UseRateLimitedState
  useQueuedValue: typeof UseQueuedValue
  useQueuedState: typeof UseQueuedState
  useAsyncQueuedState: typeof UseAsyncQueuedState
  useThrottledValue: typeof UseThrottledValue
  useThrottledState: typeof UseThrottledState
  useAsyncBatcher: typeof UseAsyncBatcher
  useAsyncDebouncer: typeof UseAsyncDebouncer
  useAsyncQueuer: typeof UseAsyncQueuer
  useAsyncRateLimiter: typeof UseAsyncRateLimiter
  useAsyncThrottler: typeof UseAsyncThrottler
  useBatcher: typeof UseBatcher
  useDebouncer: typeof UseDebouncer
  useQueuer: typeof UseQueuer
  useRateLimiter: typeof UseRateLimiter
  useThrottler: typeof UseThrottler
}

/** Creates contextual template helpers with reactive shared defaults. Pass the scope as an argument to share it with children. */
export function createPacerScope(
  defaultOptions: EmberPacerOptions<PacerProviderOptions> = {},
): EmberPacerScope {
  const read = () =>
    typeof defaultOptions === 'function' ? defaultOptions() : defaultOptions
  return {
    useDebouncedValue: class<TValue, TSelected = {}> extends UseDebouncedValue<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseDebouncedValue<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().debouncer, ...options })
      }
    },
    useDebouncedState: class<TValue, TSelected = {}> extends UseDebouncedState<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseDebouncedState<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().debouncer, ...options })
      }
    },
    useRateLimitedValue: class<
      TValue,
      TSelected = {},
    > extends UseRateLimitedValue<TValue, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseRateLimitedValue<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().rateLimiter, ...options })
      }
    },
    useRateLimitedState: class<
      TValue,
      TSelected = {},
    > extends UseRateLimitedState<TValue, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseRateLimitedState<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().rateLimiter, ...options })
      }
    },
    useQueuedValue: class<TValue, TSelected = {}> extends UseQueuedValue<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseQueuedValue<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().queuer, ...options })
      }
    },
    useQueuedState: class<
      TValue,
      TSelected extends Pick<QueuerState<TValue>, 'items'> = Pick<
        QueuerState<TValue>,
        'items'
      >,
    > extends UseQueuedState<TValue, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseQueuedState<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().queuer, ...options })
      }
    },
    useAsyncQueuedState: class<
      TValue,
      TSelected extends Pick<AsyncQueuerState<TValue>, 'items'> = Pick<
        AsyncQueuerState<TValue>,
        'items'
      >,
    > extends UseAsyncQueuedState<TValue, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncQueuedState<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncQueuer, ...options })
      }
    },
    useThrottledValue: class<TValue, TSelected = {}> extends UseThrottledValue<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseThrottledValue<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().throttler, ...options })
      }
    },
    useThrottledState: class<TValue, TSelected = {}> extends UseThrottledState<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseThrottledState<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().throttler, ...options })
      }
    },
    useAsyncBatcher: class<TValue, TSelected = {}> extends UseAsyncBatcher<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncBatcher<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncBatcher, ...options })
      }
    },
    useAsyncDebouncer: class<
      TFn extends AnyAsyncFunction,
      TSelected = {},
    > extends UseAsyncDebouncer<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncDebouncer<TFn, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncDebouncer, ...options })
      }
    },
    useAsyncQueuer: class<TValue, TSelected = {}> extends UseAsyncQueuer<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncQueuer<TValue, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncQueuer, ...options })
      }
    },
    useAsyncRateLimiter: class<
      TFn extends AnyAsyncFunction,
      TSelected = {},
    > extends UseAsyncRateLimiter<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncRateLimiter<TFn, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncRateLimiter, ...options })
      }
    },
    useAsyncThrottler: class<
      TFn extends AnyAsyncFunction,
      TSelected = {},
    > extends UseAsyncThrottler<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseAsyncThrottler<TFn, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().asyncThrottler, ...options })
      }
    },
    useBatcher: class<TValue, TSelected = {}> extends UseBatcher<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<UseBatcher<TValue, TSelected>['compute']>
      ) {
        return super.compute(args, { ...read().batcher, ...options })
      }
    },
    useDebouncer: class<
      TFn extends AnyFunction,
      TSelected = {},
    > extends UseDebouncer<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<UseDebouncer<TFn, TSelected>['compute']>
      ) {
        return super.compute(args, { ...read().debouncer, ...options })
      }
    },
    useQueuer: class<TValue, TSelected = {}> extends UseQueuer<
      TValue,
      TSelected
    > {
      override compute(
        ...[args, options]: Parameters<UseQueuer<TValue, TSelected>['compute']>
      ) {
        return super.compute(args, { ...read().queuer, ...options })
      }
    },
    useRateLimiter: class<
      TFn extends AnyFunction,
      TSelected = {},
    > extends UseRateLimiter<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<
          UseRateLimiter<TFn, TSelected>['compute']
        >
      ) {
        return super.compute(args, { ...read().rateLimiter, ...options })
      }
    },
    useThrottler: class<
      TFn extends AnyFunction,
      TSelected = {},
    > extends UseThrottler<TFn, TSelected> {
      override compute(
        ...[args, options]: Parameters<UseThrottler<TFn, TSelected>['compute']>
      ) {
        return super.compute(args, { ...read().throttler, ...options })
      }
    },
  }
}
