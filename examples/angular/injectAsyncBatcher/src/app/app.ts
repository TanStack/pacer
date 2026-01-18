import { Component, signal } from '@angular/core';
import { injectAsyncBatcher } from '@tanstack/angular-pacer';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly item = signal('');
  protected readonly lastBatch = signal<Array<string>>([]);
  protected readonly batchHistory = signal<Array<Array<string>>>([]);

  protected readonly batcher = injectAsyncBatcher(
    async (items: Array<string>) => {
      await sleep(300);
      const batch = items.map((x) => x.trim()).filter(Boolean);

      this.lastBatch.set(batch);
      this.batchHistory.update((h) => [batch, ...h]);

      return batch;
    },
    { maxSize: 3, wait: 1000 },
    (state) => ({ items: state.items, isExecuting: state.isExecuting }),
  );

  protected onItemInput(value: string): void {
    this.item.set(value);
  }

  protected addItem(): void {
    const value = this.item().trim();
    if (!value) return;

    this.batcher.addItem(value);
    this.item.set('');
  }

  protected addThree(): void {
    this.batcher.addItem('one');
    this.batcher.addItem('two');
    this.batcher.addItem('three');
  }

  protected reset(): void {
    this.item.set('');
    this.lastBatch.set([]);
    this.batchHistory.set([]);
    this.batcher.reset();
  }
}
