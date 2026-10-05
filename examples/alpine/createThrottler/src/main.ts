import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineThrottler, ThrottlerState } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

Alpine.data('counter', () => {
  const scope = createPacerScope()
  return {
    instantCount: 0,
    throttledCount: 0,
    increment() {
      const nextCount = ++this.instantCount
      this.setCountThrottler!.maybeExecute(nextCount)
    },
    setCountThrottler: null as AlpineThrottler<
      (value: number) => void,
      ThrottlerState<(value: number) => void>
    > | null,
    init() {
      this.setCountThrottler = scope.createThrottler(
        (value: number) => {
          this.throttledCount = value
        },
        () => ({
          key: 'counter',
          wait: 1000,
          // leading: true, // default
          // trailing: true, // default
          // enabled: () => instantCount.value > 2,
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
    instantSearch: '',
    throttledSearch: '',
    handleSearchChange(e: Event) {
      const newValue = (e.target as HTMLInputElement).value
      this.instantSearch = newValue
      this.setSearchThrottler!.maybeExecute(newValue)
    },
    setSearchThrottler: null as AlpineThrottler<
      (value: string) => void,
      ThrottlerState<(value: string) => void>
    > | null,
    init() {
      this.setSearchThrottler = scope.createThrottler(
        (value: string) => {
          this.throttledSearch = value
        },
        () => ({
          key: 'search',
          wait: 1000,
          enabled: () => this.instantSearch.length > 2,
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
    instantExecutionCount: 0,
    currentValue: 50,
    throttledValue: 50,
    handleRangeChange(e: Event) {
      const newValue = parseInt((e.target as HTMLInputElement).value, 10)
      // instant state update
      this.currentValue = newValue
      this.instantExecutionCount = this.instantExecutionCount + 1
      // throttled state update
      this.setValueThrottler!.maybeExecute(newValue)
    },
    setValueThrottler: null as AlpineThrottler<
      (value: number) => void,
      ThrottlerState<(value: number) => void>
    > | null,
    init() {
      this.setValueThrottler = scope.createThrottler(
        (value: number) => {
          this.throttledValue = value
        },
        () => ({
          key: 'range',
          wait: 250,
          // leading: true, // default
          // trailing: true, // default
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
