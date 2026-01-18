import { Component, signal } from '@angular/core';
import { injectQueuedSignal } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly next = signal(1);
  protected readonly lastProcessed = signal<number | null>(null);
  protected readonly processed = signal<Array<number>>([]);

  private readonly queued = injectQueuedSignal<number>(
    (item) => {
      this.lastProcessed.set(item);
      this.processed.update((prev) => [...prev, item]);
    },
    {
      wait: 500,
      started: true,
    },
  );

  protected readonly items = this.queued[0];
  private readonly addItem = this.queued[1];
  protected readonly queue = this.queued[2];

  protected enqueue(): void {
    const value = this.next();
    this.next.set(value + 1);
    this.addItem(value);
  }

  protected enqueueFive(): void {
    for (let i = 0; i < 5; i++) {
      this.enqueue();
    }
  }

  protected clearProcessed(): void {
    this.lastProcessed.set(null);
    this.processed.set([]);
  }
}
