import { Component, signal } from '@angular/core'
import { injectAsyncQueuedSignal } from '@tanstack/angular-pacer'

type ProcessedEntry = {
  timestamp: string
  item: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly value = signal('')
  protected readonly processed: Array<ProcessedEntry> = []

  private nextId = 1

  protected readonly queue = injectAsyncQueuedSignal(
    async (item: string) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      this.processed.unshift({ timestamp: new Date().toLocaleTimeString(), item })
      return item
    },
    {
      concurrency: 2,
      wait: 0,
    },
  )

  protected enqueue(): void {
    const raw = this.value().trim()
    const item = raw.length > 0 ? raw : `item-${this.nextId++}`

    this.queue.addItem(item)
    this.value.set('')
  }

  protected enqueueMany(count: number): void {
    for (let i = 0; i < count; i++) {
      this.queue.addItem(`item-${this.nextId++}`)
    }
  }

  protected start(): void {
    this.queue.queuer.start()
  }

  protected stop(): void {
    this.queue.queuer.stop()
  }

  protected reset(): void {
    this.value.set('')
    this.processed.length = 0
    this.nextId = 1

    this.queue.queuer.clear()
  }
}
