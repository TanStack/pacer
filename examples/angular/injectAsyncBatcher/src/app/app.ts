import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectAsyncBatcher } from '@tanstack/angular-pacer'

type Item = { id: number; value: string; timestamp: number }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  private nextId = 0
  readonly processedBatches = signal<
    Array<{ items: Array<Item>; result: string; timestamp: number }>
  >([])
  readonly errors = signal<Array<string>>([])
  readonly pendingItems = signal<Array<Item>>([])
  readonly isProcessing = signal(false)
  readonly successCount = signal(0)
  readonly errorCount = signal(0)
  readonly runner = injectAsyncBatcher(
    (items: Array<Item>) => this.processBatch(items),
    {
      maxSize: 5,
      wait: 4000,
      getShouldExecute: (items) =>
        items.some((item) => item.value.includes('urgent')),
      throwOnError: false,
      onItemsChange: (batcher) => this.pendingItems.set(batcher.peekAllItems()),
      onSuccess: (result, items, batcher) => {
        this.successCount.set(batcher.store.state.successCount)
        console.log('Batch succeeded:', result, items)
      },
      onError: (error, items, batcher) => {
        this.errorCount.set(batcher.store.state.errorCount)
        this.errors.update((errors) => [
          ...errors,
          `${error.message} (${new Date().toLocaleTimeString()})`,
        ])
        console.error('Batch failed:', error, items)
      },
      onSettled: (items, batcher) =>
        console.log(
          'Batch settled:',
          items,
          batcher.store.state.totalItemsProcessed,
        ),
    },
    (state) => state,
  )

  private async processBatch(items: Array<Item>): Promise<string> {
    this.isProcessing.set(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // throw new Error(`Processing failed for batch with ${items.length} items`)
      const result = `Processed ${items.length} items: ${items.map((item) => item.value).join(', ')}`
      this.processedBatches.update((batches) => [
        ...batches,
        { items, result, timestamp: Date.now() },
      ])
      return result
    } finally {
      this.isProcessing.set(false)
    }
  }
  add(urgent = false): void {
    const id = ++this.nextId
    this.runner.addItem({
      id,
      value: `${urgent ? 'urgent' : 'item'}-${id}`,
      timestamp: Date.now(),
    })
  }
}
