import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectDebouncer } from '@tanstack/angular-pacer'

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
  readonly controlledCount = signal(0)
  readonly controlledSearch = signal('')
  readonly controlledValue = signal(50)
  readonly delay = signal(250)
  readonly enabled = signal(true)
  readonly countRunner = injectDebouncer(
    (value: number) => this.controlledCount.set(value),
    () => {
      // Update options when the signal changes so disabling cancels pending work.
      // The callback reads the current event value before the next effect runs.
      this.instantCount()
      return { wait: 800, enabled: () => this.instantCount() > 2 }
    },
    (state) => state,
  )
  readonly searchRunner = injectDebouncer(
    (value: string) => this.controlledSearch.set(value),
    () => {
      // Update options when the signal changes so disabling cancels pending work.
      // The callback reads the current event value before the next effect runs.
      this.search()
      return { wait: 500, enabled: () => this.search().length > 2 }
    },
    (state) => state,
  )
  readonly rangeRunner = injectDebouncer(
    (value: number) => this.controlledValue.set(value),
    () => ({ wait: this.delay(), enabled: this.enabled() }),
    (state) => state,
  )
  increment(): void {
    const next = this.instantCount() + 1
    this.instantCount.set(next)
    this.countRunner.maybeExecute(next)
  }
  onSearch(value: string): void {
    this.search.set(value)
    this.searchRunner.maybeExecute(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
    this.rangeRunner.maybeExecute(value)
  }
  reduction(): number {
    const count = this.instantExecutions()
    return count ? Math.round(((count - this.rangeRunner.state().executionCount) / count) * 100) : 0
  }
}
