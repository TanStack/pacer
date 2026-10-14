import { Component, signal } from '@angular/core'
import { injectDebouncedSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(0)
  readonly controlledCount = injectDebouncedSignal(0, () => ({ wait: 500 }))
  readonly controlledSearch = injectDebouncedSignal('', () => {
    // Update options when the signal changes so disabling cancels pending work.
    // The callback reads the current event value before the next effect runs.
    this.search()
    return { wait: 500, enabled: () => this.search().length > 2 }
  })
  readonly controlledValue = injectDebouncedSignal(50, () => ({ wait: 250 }))
  increment(): void {
    const next = this.instantCount() + 1
    this.instantCount.set(next)
    this.controlledCount.set(next)
  }
  onSearch(value: string): void {
    this.search.set(value)
    this.controlledSearch.set(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
    this.controlledValue.set(value)
  }
}
