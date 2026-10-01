import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectThrottledValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly controlledCount = injectThrottledValue(
    this.instantCount,
    0,
    () => ({ wait: 1000 }),
    (state) => state,
  )
  readonly countRunner = this.controlledCount.throttler
  readonly controlledSearch = injectThrottledValue(
    this.search,
    '',
    () => ({ wait: 1000 }),
    (state) => state,
  )
  readonly searchRunner = this.controlledSearch.throttler
  readonly controlledValue = injectThrottledValue(
    this.currentValue,
    50,
    () => ({ wait: 250 }),
    (state) => state,
  )
  readonly rangeRunner = this.controlledValue.throttler
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
  reduction(): number {
    const count = this.instantExecutions()
    return count
      ? Math.round(
          ((count - this.rangeRunner.state().executionCount) / count) * 100,
        )
      : 0
  }
}
