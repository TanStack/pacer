import { Component, signal } from '@angular/core'
import { injectAsyncBatchedCallback } from '@tanstack/angular-pacer'

type BatchEntry = {
  timestamp: string
  items: Array<string>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly value = signal('')
  protected readonly queuedCount = signal(0)
  protected readonly isProcessing = signal(false)

  protected readonly processedBatches: Array<BatchEntry> = []

  private nextId = 1

  protected readonly addToBatch = injectAsyncBatchedCallback<string>(
    async (items) => {
      this.isProcessing.set(true)
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 500))

        this.processedBatches.unshift({
          timestamp: new Date().toLocaleTimeString(),
          items: [...items],
        })

        this.queuedCount.update((c) => Math.max(0, c - items.length))
      } finally {
        this.isProcessing.set(false)
      }
    },
    {
      maxSize: 5,
      wait: 1000,
    },
  )

  protected enqueue(): void {
    const raw = this.value().trim()
    const item = raw.length > 0 ? raw : `item-${this.nextId++}`

    this.queuedCount.update((c) => c + 1)
    void this.addToBatch(item)
    this.value.set('')
  }

  protected enqueueMany(count: number): void {
    for (let i = 0; i < count; i++) {
      this.value.set(`item-${this.nextId++}`)
      this.enqueue()
    }
  }

  protected reset(): void {
    this.value.set('')
    this.queuedCount.set(0)
    this.isProcessing.set(false)
    this.processedBatches.length = 0
    this.nextId = 1
  }
}
