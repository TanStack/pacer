import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectThrottledSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(0)
  readonly controlledCount = injectThrottledSignal(
    0,
    () => ({ wait: 1000 }),
    (state) => state,
  )
  readonly countRunner = this.controlledCount.throttler
  readonly controlledSearch = injectThrottledSignal(
    '',
    () => ({ wait: 1000 }),
    (state) => state,
  )
  readonly searchRunner = this.controlledSearch.throttler
  readonly controlledValue = injectThrottledSignal(
    50,
    () => ({ wait: 250 }),
    (state) => state,
  )
  readonly rangeRunner = this.controlledValue.throttler
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
  reduction(): number {
    const count = this.instantExecutions()
    return count ? Math.round(((count - this.rangeRunner.state().executionCount) / count) * 100) : 0
  }
}
