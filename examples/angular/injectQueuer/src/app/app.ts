import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectQueuer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly currentValue = signal(50)
  readonly rangeValue = signal(50)
  readonly instantExecutions = signal(1)
  readonly processed = signal<Array<number>>([])
  readonly numberQueue = injectQueuer(
    (item: number) => this.processed.update((items) => [...items, item]),
    {
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, index) => index + 1),
      started: false,
      wait: 1000,
    },
    (state) => state,
  )
  readonly rangeQueue = injectQueuer(
    (item: number) => this.rangeValue.set(item),
    { maxSize: 100, wait: 100, initialItems: [50] },
    (state) => state,
  )
  addNumber(): void {
    const items = this.numberQueue.peekAllItems()
    this.numberQueue.addItem(items.length ? items[items.length - 1]! + 1 : 1)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
    this.rangeQueue.addItem(value)
  }
}
