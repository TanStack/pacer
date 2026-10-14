import { Component, input, signal } from '@angular/core'
import { injectQueuerItems } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-input',
  template: `
    <h2>Required input</h2>
    <p>value: {{ value() }}</p>
    <p>Value (queued): {{ processed() }}</p>
    <p>Queue length: {{ queued().length }}</p>
    <button (click)="queued.queuer.addItem(value())">Enqueue input</button>
    <button (click)="enqueueRandom()">Enqueue random</button>
  `,
})
export class InputApp {
  readonly value = input.required<string>()
  readonly processed = signal('')
  readonly queued = injectQueuerItems((value: string) => this.processed.set(value), { wait: 500 })
  enqueueRandom(): void {
    this.queued.queuer.addItem(Math.random().toFixed(4))
  }
}
