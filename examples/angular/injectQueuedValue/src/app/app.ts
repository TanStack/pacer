import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectQueuedValue } from '@tanstack/angular-pacer'
import { InputApp } from './inputapp'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe, InputApp],
})
export class App {
  readonly source = signal('')
  readonly currentValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly queued = injectQueuedValue(
    this.source,
    '',
    { maxSize: 25, wait: 500 },
    (state) => state,
  )
  readonly queuer = this.queued.queuer
  readonly rangeQueued = injectQueuedValue(
    this.currentValue,
    50,
    { maxSize: 100, wait: 100 },
    (state) => state,
  )
  readonly rangeQueue = this.rangeQueued.queuer
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
  }
}
