import { Component, input } from '@angular/core'
import { injectQueuedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <h1>NG0950</h1>
    <p>value: {{ value() }}</p>
    <p>Value (queued): {{ queued() }}</p>
    <p>Queue length: {{ queued().length }}</p>
    <button (click)="enqueueRandom()">Enqueue random</button>
  `,
})
export class InputApp {
  readonly value = input.required<string>()

  protected readonly queued = injectQueuedValue(this.value, null, { wait: 500 }, (state) => ({
    items: state.items,
  }))

  protected enqueueRandom(): void {
    // You can also enqueue values directly without touching `source`
    this.queued.addItem(Math.random().toFixed(4))
  }
}
