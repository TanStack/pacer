import { Component, signal } from '@angular/core'
import { injectDebouncedCallback } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html', imports: [] })
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly controlledCount = signal(0)
  readonly controlledSearch = signal('')
  readonly controlledValue = signal(50)
  readonly countRunner = injectDebouncedCallback(
    (value: number) => this.controlledCount.set(value),
    () => ({ wait: 500 }),
  )
  readonly searchRunner = injectDebouncedCallback(
    (value: string) => this.controlledSearch.set(value),
    () => {
      // Update options when the signal changes so disabling cancels pending work.
      // The callback reads the current event value before the next effect runs.
      this.search()
      return { wait: 500, enabled: () => this.search().length > 2 }
    },
  )
  readonly rangeRunner = injectDebouncedCallback(
    (value: number) => this.controlledValue.set(value),
    () => ({ wait: 250 }),
  )
  increment(): void {
    const next = this.instantCount() + 1
    this.instantCount.set(next)
    this.countRunner(next)
  }
  onSearch(value: string): void {
    this.search.set(value)
    this.searchRunner(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.rangeRunner(value)
  }
}
