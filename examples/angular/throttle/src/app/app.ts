import { Component, signal } from '@angular/core'
import { throttle } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html', imports: [] })
export class App {
  readonly instantCount = signal(0)
  readonly search = signal('')
  readonly currentValue = signal(50)
  readonly controlledCount = signal(0)
  readonly controlledSearch = signal('')
  readonly controlledValue = signal(50)
  readonly countRunner = throttle(
    (value: number) => this.controlledCount.set(value),
    { wait: 1000 },
  )
  readonly searchRunner = throttle(
    (value: string) => this.controlledSearch.set(value),
    { wait: 1000 },
  )
  readonly rangeRunner = throttle(
    (value: number) => this.controlledValue.set(value),
    { wait: 250 },
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
