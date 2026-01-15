import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { createBatcher } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Batcher example
  protected readonly batcher = createBatcher<
    string,
    { items: Array<string>; size: number; isPending: boolean }
  >(
    (items) => {
      console.log('Processing batch:', items);
      this.processedBatches.push({
        timestamp: new Date().toLocaleTimeString(),
        items: [...items],
        count: items.length,
      });
    },
    { maxSize: 3, wait: 2000 },
    (state) => ({
      items: state.items,
      size: state.size,
      isPending: state.isPending,
    }),
  );

  protected readonly processedBatches: Array<{
    timestamp: string;
    items: Array<string>;
    count: number;
  }> = [];

  protected addToBatch(item: string): void {
    this.batcher.addItem(item);
  }

  protected flushBatch(): void {
    this.batcher.flush();
  }
}
