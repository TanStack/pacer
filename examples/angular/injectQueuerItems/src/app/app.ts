import { Component, signal } from '@angular/core'
import { injectQueuerItems } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly currentValue = signal(50)
  readonly rangeValue = signal(50)
  readonly instantExecutions = signal(0)
  readonly processed = signal<Array<number>>([])
  readonly queued = injectQueuerItems(
    (item: number) => this.processed.update((items) => [...items, item]),
    {
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, index) => index + 1),
      started: false,
      wait: 1000,
    },
  )
  readonly numberQueue = this.queued.queuer
  readonly rangeQueued = injectQueuerItems((item: number) => this.rangeValue.set(item), {
    maxSize: 100,
    wait: 100,
  })
  readonly rangeQueue = this.rangeQueued.queuer
  addNumber(): void {
    const items = this.numberQueue.peekAllItems()
    this.queued.addItem(items.length ? items[items.length - 1]! + 1 : 1)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
    this.rangeQueued.addItem(value)
  }
}
