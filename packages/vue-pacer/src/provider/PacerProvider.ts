import { provide, inject, defineComponent } from 'vue'
import type { InjectionKey, PropType } from 'vue'
import type {
  AnyAsyncFunction,
  AnyFunction,
  AsyncBatcherOptions,
  AsyncDebouncerOptions,
  AsyncQueuerOptions,
  AsyncRateLimiterOptions,
  AsyncThrottlerOptions,
  BatcherOptions,
  DebouncerOptions,
  QueuerOptions,
  RateLimiterOptions,
  ThrottlerOptions,
} from '@tanstack/pacer'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<AsyncBatcherOptions<any>>
  asyncDebouncer?: Partial<AsyncDebouncerOptions<AnyAsyncFunction>>
  asyncQueuer?: Partial<AsyncQueuerOptions<any>>
  asyncRateLimiter?: Partial<AsyncRateLimiterOptions<AnyAsyncFunction>>
  asyncThrottler?: Partial<AsyncThrottlerOptions<AnyAsyncFunction>>
  batcher?: Partial<BatcherOptions<any>>
  debouncer?: Partial<DebouncerOptions<AnyFunction>>
  queuer?: Partial<QueuerOptions<any>>
  rateLimiter?: Partial<RateLimiterOptions<AnyFunction>>
  throttler?: Partial<ThrottlerOptions<AnyFunction>>
}

interface PacerContextValue {
  defaultOptions: PacerProviderOptions
}

const PacerContextKey: InjectionKey<PacerContextValue> = Symbol('PacerContext')

export interface PacerProviderProps {
  defaultOptions?: PacerProviderOptions
}

const DEFAULT_OPTIONS: PacerProviderOptions = {}

export const PacerProvider = defineComponent({
  name: 'PacerProvider',
  props: {
    defaultOptions: {
      type: Object as PropType<PacerProviderOptions>,
      default: () => DEFAULT_OPTIONS,
    },
  },
  setup(props, { slots }) {
    provide(PacerContextKey, {
      defaultOptions: props.defaultOptions,
    })
    return () => slots.default?.()
  },
})

export function usePacerContext() {
  return inject(PacerContextKey, null)
}

export function useDefaultPacerOptions() {
  const context = inject(PacerContextKey, null)
  return context?.defaultOptions ?? {}
}
