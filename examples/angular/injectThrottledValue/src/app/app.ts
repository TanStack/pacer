import { Component, signal } from '@angular/core'
import { injectThrottledValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly controlledCount = injectThrottledValue(this.instantCount, () => ({ wait: 1000 }))
  readonly controlledSearch = injectThrottledValue(this.search, () => ({ wait: 1000 }))
  readonly controlledValue = injectThrottledValue(this.currentValue, () => ({ wait: 250 }))
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
