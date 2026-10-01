import { Component, signal } from '@angular/core'
import { injectRateLimitedCallback } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html', imports: [] })
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly controlledCount = signal(0)
  readonly controlledSearch = signal('')
  readonly controlledValue = signal(50)
  readonly countWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly searchWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly rangeWindow = signal<'fixed' | 'sliding'>('fixed')
  readonly countRunner = injectRateLimitedCallback(
    (value: number) => this.controlledCount.set(value),
    () => {
      // Update options when the signal changes so disabling cancels pending work.
      // The callback reads the current event value before the next effect runs.
      this.instantCount()
      return {
        limit: 5,
        window: 5000,
        windowType: this.countWindow(),
        onReject: (limiter) =>
          console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
        enabled: () => this.instantCount() > 2,
      }
    },
  )
  readonly searchRunner = injectRateLimitedCallback(
    (value: string) => this.controlledSearch.set(value),
    () => {
      // Update options when the signal changes so disabling cancels pending work.
      // The callback reads the current event value before the next effect runs.
      this.search()
      return {
        limit: 5,
        window: 5000,
        windowType: this.searchWindow(),
        onReject: (limiter) =>
          console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
        enabled: () => this.search().length > 2,
      }
    },
  )
  readonly rangeRunner = injectRateLimitedCallback(
    (value: number) => this.controlledValue.set(value),
    () => ({
      limit: 20,
      window: 2000,
      windowType: this.rangeWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    }),
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
