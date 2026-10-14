import { Component, signal } from '@angular/core'
import { injectAsyncQueuerItems } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly concurrency = signal(2)
  readonly running = signal(false)
  readonly processed = signal<Array<number>>([])
  readonly queue = injectAsyncQueuerItems(
    async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.processed.update((items) => [...items, item])
      console.log(`Processed ${item}`)
    },
    () => ({
      maxSize: 25,
      initialItems: Array.from({ length: 10 }, (_, index) => index + 1),
      concurrency: this.concurrency(),
      started: false,
      wait: 100,
      onReject: (item, queuer) =>
        console.log('Queue is full, rejecting item', item, queuer.store.state.rejectionCount),
      onError: (error, item, queuer) =>
        console.error(`Error processing item: ${item}`, error, queuer.store.state.errorCount),
    }),
  )
  readonly runner = this.queue.queuer
  start(): void {
    this.running.set(true)
    this.runner.start()
  }
  stop(): void {
    this.running.set(false)
    this.runner.stop()
  }
  add(): void {
    const items = this.queue()
    this.queue.addItem(items.length ? Math.max(...items) + 1 : 1)
  }
  setConcurrency(value: string): void {
    this.concurrency.set(Math.max(1, Number.parseInt(value) || 1))
  }
}
