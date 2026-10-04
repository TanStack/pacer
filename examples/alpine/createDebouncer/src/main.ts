import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineDebouncer, DebouncerState } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

type SelectedDebouncer<T> = AlpineDebouncer<
  (value: T) => void,
  DebouncerState<(value: T) => void>
>

Alpine.data('counter', () => {
  const scope = createPacerScope()
  return {
    instantCount: 0,
    debouncedCount: 0,
    debouncer: null as SelectedDebouncer<number> | null,
    init() {
      this.debouncer = scope.createDebouncer(
        (value: number) => {
          this.debouncedCount = value
        },
        { key: 'counter', wait: 800, enabled: () => this.instantCount > 2 },
        (state) => state,
      )
    },
    increment() {
      this.instantCount++
      this.debouncer!.maybeExecute(this.instantCount)
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.data('search', () => {
  const scope = createPacerScope()
  return {
    searchText: '',
    debouncedSearchText: '',
    setSearchDebouncer: null as SelectedDebouncer<string> | null,
    init() {
      this.setSearchDebouncer = scope.createDebouncer(
        (value: string) => {
          this.debouncedSearchText = value
        },
        { key: 'search', wait: 500, enabled: () => this.searchText.length > 2 },
        (state) => state,
      )
    },
    handleSearchChange(event: Event) {
      this.searchText = (event.target as HTMLInputElement).value
      this.setSearchDebouncer!.maybeExecute(this.searchText)
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
    debouncedValue: 50,
    instantExecutionCount: 0,
    wait: 250,
    enabled: true,
    setValueDebouncer: null as SelectedDebouncer<number> | null,
    init() {
      this.setValueDebouncer = scope.createDebouncer(
        (value: number) => {
          this.debouncedValue = value
        },
        () => ({ key: 'range', wait: this.wait, enabled: this.enabled }),
        (state) => state,
      )
    },
    handleRangeChange(event: Event) {
      this.currentValue = Number((event.target as HTMLInputElement).value)
      this.instantExecutionCount++
      this.setValueDebouncer!.maybeExecute(this.currentValue)
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
