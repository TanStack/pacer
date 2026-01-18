import { Component, signal } from '@angular/core';
import { injectAsyncThrottledCallback } from '@tanstack/angular-pacer';

type HistoryEntry = {
  timestamp: string;
  value: string;
  executed: boolean;
  result?: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly value = signal('');
  protected readonly isExecuting = signal(false);
  protected readonly lastOutcome = signal<'idle' | 'executed' | 'throttled'>('idle');
  protected readonly lastResult = signal<string | null>(null);

  protected readonly history: Array<HistoryEntry> = [];

  private nextId = 1;

  protected readonly save = injectAsyncThrottledCallback(
    async (value: string) => {
      this.isExecuting.set(true);
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
        const result = `saved:${value}`;
        this.lastResult.set(result);
        return result;
      } finally {
        this.isExecuting.set(false);
      }
    },
    {
      wait: 1000,
    },
  );

  protected runOnce(): void {
    const v = this.value().trim() || `value-${this.nextId++}`;
    this.value.set(v);
    void this.attempt(v);
  }

  protected runBurst(count: number): void {
    for (let i = 0; i < count; i++) {
      void this.attempt(`value-${this.nextId++}`);
    }
  }

  protected reset(): void {
    this.value.set('');
    this.isExecuting.set(false);
    this.lastOutcome.set('idle');
    this.lastResult.set(null);
    this.history.length = 0;
    this.nextId = 1;
  }

  private async attempt(value: string): Promise<void> {
    const timestamp = new Date().toLocaleTimeString();

    const result = await this.save(value);

    if (result === undefined) {
      this.lastOutcome.set('throttled');
      this.history.unshift({ timestamp, value, executed: false });
      return;
    }

    this.lastOutcome.set('executed');
    this.history.unshift({ timestamp, value, executed: true, result });
  }
}
