import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { createBatcher } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly input = signal('')
  protected readonly queuedCount = signal(0)
  protected readonly processedCount = signal(0)
  protected readonly lastBatch = signal<Array<string>>([])

  protected readonly batcher = createBatcher<
    string,
    {
      items: Array<string>
      isPending: boolean
      executionCount: number
      status: string
    }
  >(
    (items) => {
      this.lastBatch.set(items)
      this.processedCount.update((c) => c + items.length)
    },
    { maxSize: 5, wait: 1000 },
    (state) => ({
      items: state.items,
      isPending: state.isPending,
      executionCount: state.executionCount,
      status: state.status,
    }),
  )

  protected onInput(value: string): void {
    this.input.set(value)
  }

  protected add(): void {
    const value = this.input().trim()
    if (!value) return
    this.batcher.addItem(value)
    this.queuedCount.update((c) => c + 1)
    this.input.set('')
  }

  protected flush(): void {
    this.batcher.flush()
  }

  protected reset(): void {
    this.input.set('')
    this.queuedCount.set(0)
    this.processedCount.set(0)
    this.lastBatch.set([])
    this.batcher.reset()
  }
}
