import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectBatcher } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly processedBatches = signal<Array<Array<number>>>([])
  readonly pendingItems = signal<Array<number>>([])
  readonly runner = injectBatcher(
    (items: Array<number>) => {
      this.processedBatches.update((batches) => [...batches, items])
    },
    {
      maxSize: 5,
      wait: 3000,
      getShouldExecute: (items) => items.includes(42),
      onItemsChange: (batcher) => this.pendingItems.set(batcher.peekAllItems()),
    },
    (state) => state,
  )
  add(): void {
    const items = this.pendingItems()
    this.runner.addItem(items.length ? items[items.length - 1]! + 1 : 1)
  }
}
