import { Component, signal } from '@angular/core'
import { injectQueuedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly source = signal('')

  // A queued value: changes are applied in-order, with an optional delay between items.
  // `value()` is the current processed value, and `items()` exposes the pending queue.
  protected readonly queued = injectQueuedValue(this.source, { wait: 500 }, (state) => ({
    items: state.items,
  }))

  protected onInput(value: string): void {
    // Updating `source` automatically enqueues the latest value (via injectQueuedValue's internal effect)
    this.source.set(value)
  }

  protected enqueueRandom(): void {
    // You can also enqueue values directly without touching `source`
    this.queued.addItem(Math.random().toFixed(4))
  }

  protected clear(): void {
    this.source.set('')
    // If you only want the queued output to change (without changing source), you could do:
    // this.queued.addItem('');
  }
}
