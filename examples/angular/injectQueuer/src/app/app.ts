import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectQueuer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly input = signal('')
  protected readonly processedCount = signal(0)
  protected readonly lastProcessed = signal('')

  protected readonly queue = injectQueuer<
    string,
    { items: Array<string>; size: number; isRunning: boolean }
  >(
    (item) => {
      this.lastProcessed.set(item)
      this.processedCount.update((c) => c + 1)
    },
    {
      started: false,
      wait: 500,
    },
    (state) => ({
      items: state.items,
      size: state.size,
      isRunning: state.isRunning,
    }),
  )

  protected onInput(value: string): void {
    this.input.set(value)
  }

  protected add(): void {
    const value = this.input().trim()
    if (!value) return
    this.queue.addItem(value)
    this.input.set('')
  }

  protected start(): void {
    this.queue.start()
  }

  protected stop(): void {
    this.queue.stop()
  }

  protected reset(): void {
    this.input.set('')
    this.processedCount.set(0)
    this.lastProcessed.set('')
    this.queue.reset()
    this.queue.stop()
  }
}
