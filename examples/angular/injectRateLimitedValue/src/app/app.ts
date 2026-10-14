import { Component, signal } from '@angular/core'
import { injectRateLimitedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly countWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly searchWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly rangeWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly controlledCount = injectRateLimitedValue(this.instantCount, () => ({
    limit: 5,
    window: 5000,
    windowType: this.countWindow(),
    onReject: (limiter) => console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
  }))
  readonly controlledSearch = injectRateLimitedValue(this.search, () => ({
    limit: 5,
    window: 5000,
    windowType: this.searchWindow(),
    onReject: (limiter) => console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
  }))
  readonly controlledValue = injectRateLimitedValue(this.currentValue, () => ({
    limit: 20,
    window: 2000,
    windowType: this.rangeWindow(),
    onReject: (limiter) => console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
  }))
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
