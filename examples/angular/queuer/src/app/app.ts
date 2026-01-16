import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { createQueuer } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly processedItems: Array<string> = [];

  // Queuer example - processes items one at a time with a 1 second delay
  protected readonly queuer = createQueuer<
    string,
    {
      items: Array<string>;
      size: number;
      status: string;
      executionCount: number;
      isEmpty: boolean;
      isFull: boolean;
      isRunning: boolean;
    }
  >(
    (item) => {
      console.log('Processing item:', item);
      this.processedItems.push(item);
    },
    {
      started: false,
      wait: 1000, // Wait 1 second between processing items
      maxSize: 10,
    },
    (state) => ({
      items: state.items,
      size: state.size,
      status: state.status,
      executionCount: state.executionCount,
      isEmpty: state.isEmpty,
      isFull: state.isFull,
      isRunning: state.isRunning,
    }),
  );

  protected addItem(item: string): void {
    if (!this.queuer.state().isFull) {
      this.queuer.addItem(item);
    }
  }

  protected processNext(): void {
    const item = this.queuer.getNextItem();
    if (item !== undefined) {
      console.log('Manually processed item:', item);
    }
  }

  protected startProcessing(): void {
    this.queuer.start();
  }

  protected stopProcessing(): void {
    this.queuer.stop();
  }

  protected clearQueue(): void {
    this.queuer.clear();
  }

  protected resetQueue(): void {
    this.queuer.reset();
    this.processedItems.length = 0;
  }
}
