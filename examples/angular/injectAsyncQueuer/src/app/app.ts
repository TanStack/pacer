import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectAsyncQueuer } from '@tanstack/angular-pacer';

type Job = {
  id: number;
  text: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private nextId = 0;

  protected readonly nextText = signal('hello');
  protected readonly lastAdd = signal<'added' | 'rejected' | null>(null);
  protected readonly results = signal<Array<string>>([]);

  protected readonly queuer = injectAsyncQueuer(
    async (job: Job) => {
      await sleep(500);
      return job.text.toUpperCase();
    },
    {
      concurrency: 2,
      wait: 200,
      maxSize: 5,
      onSuccess: (result, job) => {
        this.results.update((r) => [...r, `#${job.id}: ${String(result)}`]);
      },
      onReject: (job) => {
        this.results.update((r) => [...r, `#${job.id}: rejected (queue full)`]);
      },
      onError: (err, job) => {
        this.results.update((r) => [...r, `#${job.id}: error (${err.message})`]);
      },
    },
    (state) => state,
  );

  protected add(): void {
    const job: Job = { id: ++this.nextId, text: this.nextText() };
    const ok = this.queuer.addItem(job);
    this.lastAdd.set(ok ? 'added' : 'rejected');
  }

  protected start(): void {
    this.queuer.start();
  }

  protected stop(): void {
    this.queuer.stop();
  }

  protected clear(): void {
    this.queuer.clear();
  }

  protected async flush(): Promise<void> {
    await this.queuer.flush();
  }

  protected reset(): void {
    this.queuer.reset();
    this.results.set([]);
    this.lastAdd.set(null);
    this.nextId = 0;
  }
}
