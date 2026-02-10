import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectAsyncBatcher } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected itemId = 0

  protected readonly logs = signal<Array<string>>([])

  protected readonly batcher = injectAsyncBatcher<
    number,
    {
      items: Array<number>
      isExecuting: boolean
    }
  >(
    async (items) => {
      // simulate async work taking ~1s
      await new Promise((r) => setTimeout(r, 1000))

      const entry = `${new Date().toLocaleTimeString()} - processed [${items.join(', ')}]`
      this.logs.update((l) => [entry, ...l])
    },
    {
      maxSize: 3,
      wait: 3000,
    },
    (state) => ({
      items: state.items,
      isExecuting: state.isExecuting,
    }),
  )

  protected add(): void {
    this.itemId++
    this.batcher.addItem(this.itemId)
  }

  protected flush(): void {
    this.batcher.flush()
  }

  protected reset(): void {
    this.batcher.reset()
    this.itemId = 0
    this.logs.set([])
  }
}
