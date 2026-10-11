import Alpine from 'alpinejs'
import { createPacerScope, rateLimiterOptions } from '@tanstack/alpine-pacer'
import type {
  AlpineRateLimiter,
  RateLimiterState,
} from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

Alpine.data('counter', () => {
  const scope = createPacerScope()
  return {
    commonRateLimiterOptions: rateLimiterOptions({
      limit: 5,
      window: 5000,
    }),
    windowType: 'fixed' as 'fixed' | 'sliding',
    instantCount: 0,
    limitedCount: 0,
    increment() {
      const nextCount = ++this.instantCount
      this.rateLimiter!.maybeExecute(nextCount)
    },
    rateLimiter: null as AlpineRateLimiter<
      (value: number) => void,
      RateLimiterState
    > | null,
    init() {
      this.rateLimiter = scope.createRateLimiter(
        (value: number) => {
          this.limitedCount = value
        },
        () => ({
          key: 'counter',
          // enabled: () => instantCount.value > 2,
          ...this.commonRateLimiterOptions,
          windowType: this.windowType,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('search', () => {
  const scope = createPacerScope()
  return {
    commonRateLimiterOptions: rateLimiterOptions({
      limit: 5,
      window: 5000,
    }),
    instantSearch: '',
    limitedSearch: '',
    handleSearchChange(e: Event) {
      const newValue = (e.target as HTMLInputElement).value
      this.instantSearch = newValue
      this.rateLimiter!.maybeExecute(newValue)
    },
    rateLimiter: null as AlpineRateLimiter<
      (value: string) => void,
      RateLimiterState
    > | null,
    init() {
      this.rateLimiter = scope.createRateLimiter(
        (value: string) => {
          this.limitedSearch = value
        },
        () => ({
          key: 'search',
          enabled: () => this.instantSearch.length > 2, // optional, defaults to true
          ...this.commonRateLimiterOptions,
          // windowType: 'sliding', // default is 'fixed'
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('range', () => {
  const scope = createPacerScope()
  return {
    currentValue: 50,
    limitedValue: 50,
    instantExecutionCount: 0,
    handleRangeChange(e: Event) {
      const newValue = parseInt((e.target as HTMLInputElement).value, 10)
      this.currentValue = newValue
      this.instantExecutionCount = this.instantExecutionCount + 1
      this.rateLimiter!.maybeExecute(newValue)
    },
    rateLimiter: null as AlpineRateLimiter<
      (value: number) => void,
      RateLimiterState
    > | null,
    init() {
      this.rateLimiter = scope.createRateLimiter(
        (value: number) => {
          this.limitedValue = value
        },
        () => ({
          key: 'range',
          limit: 20,
          window: 2000,
          onReject: (rateLimiter) =>
            console.log(
              'Rejected by rate limiter',
              rateLimiter.getMsUntilNextWindow(),
            ),
        }),
        (state) => state,
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('devtools', () => {
  let host: TanStackDevtoolsCore | undefined
  let target: HTMLDivElement | undefined
  return {
    init() {
      if (!import.meta.env.DEV) return
      target = document.createElement('div')
      document.body.append(target)
      host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
      host.mount(target)
    },
    destroy() {
      host?.unmount()
      target?.remove()
    },
  }
})
Alpine.start()
