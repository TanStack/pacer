import {
  defineComponent,
  getCurrentInstance,
  getCurrentScope,
  inject,
  provide,
} from 'vue'
import type { InjectionKey, PropType } from 'vue'
import type { VuePacerOptions } from '../types'
import type { VueAsyncBatcherOptions } from '../async-batcher/useAsyncBatcher'
import type { VueAsyncDebouncerOptions } from '../async-debouncer/useAsyncDebouncer'
import type { VueAsyncQueuerOptions } from '../async-queuer/useAsyncQueuer'
import type { VueAsyncRateLimiterOptions } from '../async-rate-limiter/useAsyncRateLimiter'
import type { VueAsyncThrottlerOptions } from '../async-throttler/useAsyncThrottler'
import type { VueBatcherOptions } from '../batcher/useBatcher'
import type { VueDebouncerOptions } from '../debouncer/useDebouncer'
import type { VueQueuerOptions } from '../queuer/useQueuer'
import type { VueRateLimiterOptions } from '../rate-limiter/useRateLimiter'
import type { VueThrottlerOptions } from '../throttler/useThrottler'

export interface PacerProviderOptions {
  asyncBatcher?: Partial<VueAsyncBatcherOptions<any, any>>
  asyncDebouncer?: Partial<VueAsyncDebouncerOptions<any, any>>
  asyncQueuer?: Partial<VueAsyncQueuerOptions<any, any>>
  asyncRateLimiter?: Partial<VueAsyncRateLimiterOptions<any, any>>
  asyncThrottler?: Partial<VueAsyncThrottlerOptions<any, any>>
  batcher?: Partial<VueBatcherOptions<any, any>>
  debouncer?: Partial<VueDebouncerOptions<any, any>>
  queuer?: Partial<VueQueuerOptions<any, any>>
  rateLimiter?: Partial<VueRateLimiterOptions<any, any>>
  throttler?: Partial<VueThrottlerOptions<any, any>>
}

const PacerContext: InjectionKey<() => PacerProviderOptions> = Symbol('Pacer')
/** Provides reactive defaults to descendant components. Local options take precedence. */
export const PacerProvider = defineComponent({
  name: 'PacerProvider',
  props: {
    defaultOptions: {
      type: Object as PropType<PacerProviderOptions>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    provide(PacerContext, () => props.defaultOptions)
    return () => slots.default?.()
  },
})
/** Provides defaults from setup without a wrapper component. */
export function providePacerOptions(
  options: VuePacerOptions<PacerProviderOptions>,
) {
  provide(PacerContext, () =>
    typeof options === 'function' ? options() : options,
  )
}
/** Reads the nearest provider. Also supports standalone effect scopes with no defaults. */
export function useDefaultPacerOptions(): () => PacerProviderOptions {
  if (!getCurrentScope())
    throw new Error('Pacer composables require an active Vue effect scope')
  return getCurrentInstance() ? inject(PacerContext, () => ({})) : () => ({})
}
