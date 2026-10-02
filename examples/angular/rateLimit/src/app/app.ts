import { Component, signal } from '@angular/core'
import { rateLimit } from '@tanstack/angular-pacer'

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
  private createCountRunner() {
    return rateLimit((value: number) => this.controlledCount.set(value), {
      limit: 5,
      window: 5000,
      windowType: this.countWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    })
  }
  private countRunner = this.createCountRunner()
  private createSearchRunner() {
    return rateLimit((value: string) => this.controlledSearch.set(value), {
      limit: 5,
      window: 5000,
      windowType: this.searchWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    })
  }
  private searchRunner = this.createSearchRunner()
  private createRangeRunner() {
    return rateLimit((value: number) => this.controlledValue.set(value), {
      limit: 30,
      window: 2000,
      windowType: this.rangeWindow(),
      onReject: (limiter) =>
        console.log('Rejected; retry in', limiter.getMsUntilNextWindow(), 'ms'),
    })
  }
  private rangeRunner = this.createRangeRunner()
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
  changeWindow(scenario: 'count' | 'search' | 'range', value: 'fixed' | 'sliding'): void {
    if (scenario === 'count') {
      this.countWindow.set(value)
      this.countRunner = this.createCountRunner()
    }
    if (scenario === 'search') {
      this.searchWindow.set(value)
      this.searchRunner = this.createSearchRunner()
    }
    if (scenario === 'range') {
      this.rangeWindow.set(value)
      this.rangeRunner = this.createRangeRunner()
    }
  }
}
