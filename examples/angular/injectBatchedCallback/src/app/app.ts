import { Component, signal } from '@angular/core'
import { injectBatchedCallback } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly value = signal('')
  protected readonly queuedCount = signal(0)

  protected readonly processedBatches: Array<{
    timestamp: string
    items: Array<string>
  }> = []

  private nextId = 1

  protected readonly addToBatch = injectBatchedCallback<string>(
    (items) => {
      this.processedBatches.unshift({
        timestamp: new Date().toLocaleTimeString(),
        items: [...items],
      })

      this.queuedCount.update((c) => Math.max(0, c - items.length))
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
    this.addToBatch(item)
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
    this.processedBatches.length = 0
    this.nextId = 1
  }
}
