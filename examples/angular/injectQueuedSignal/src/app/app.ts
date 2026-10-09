import { Component, signal } from '@angular/core'
import { injectQueuedSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly source = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(0)
  readonly queued = injectQueuedSignal('', { maxSize: 25, wait: 500 }, (state) => state)
  readonly queuer = this.queued.queuer
  readonly rangeQueued = injectQueuedSignal(50, { maxSize: 100, wait: 100 }, (state) => state)
  readonly rangeQueue = this.rangeQueued.queuer
  onSearch(value: string): void {
    this.source.set(value)
    this.queued.set(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.rangeQueued.set(value)
    this.instantExecutions.update((count) => count + 1)
  }
}
