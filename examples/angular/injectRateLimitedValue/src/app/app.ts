import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectRateLimitedValue } from '@tanstack/angular-pacer'

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
  readonly countWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly searchWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly rangeWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly controlledCount = injectRateLimitedValue(
    this.instantCount,
    0,
    () => ({
      limit: 5,
      window: 5000,
      windowType: this.countWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    }),
    (state) => state,
  )
  readonly countRunner = this.controlledCount.rateLimiter
  readonly controlledSearch = injectRateLimitedValue(
    this.search,
    '',
    () => ({
      limit: 5,
      window: 5000,
      windowType: this.searchWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    }),
    (state) => state,
  )
  readonly searchRunner = this.controlledSearch.rateLimiter
  readonly controlledValue = injectRateLimitedValue(
    this.currentValue,
    50,
    () => ({
      limit: 20,
      window: 2000,
      windowType: this.rangeWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    }),
    (state) => state,
  )
  readonly rangeRunner = this.controlledValue.rateLimiter
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
