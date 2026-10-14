import { Component, signal } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'
import { InputApp } from './inputapp'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [InputApp],
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly controlledCount = injectDebouncedValue(this.instantCount, () => ({ wait: 500 }))
  readonly controlledSearch = injectDebouncedValue(this.search, () => {
    // Update options when the signal changes so disabling cancels pending work.
    // The callback reads the current event value before the next effect runs.
    this.search()
    return { wait: 500, enabled: () => this.search().length > 2 }
  })
  readonly controlledValue = injectDebouncedValue(this.currentValue, () => ({ wait: 250 }))
  increment(): void {
    const next = this.instantCount() + 1
    this.instantCount.set(next)
  }
  onSearch(value: string): void {
    this.search.set(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
  }
}
