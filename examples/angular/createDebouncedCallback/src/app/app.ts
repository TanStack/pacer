import { Component, signal } from '@angular/core';
import { createDebouncedCallback } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly query = signal('');
  protected readonly debouncedQuery = signal('');

  protected readonly onQueryInput = createDebouncedCallback(
    (value: string) => {
      this.debouncedQuery.set(value);
    },
    { wait: 500 },
  );

  protected onInput(value: string): void {
    this.query.set(value);
    this.onQueryInput(value);
  }

  protected clear(): void {
    this.query.set('');
    this.debouncedQuery.set('');
  }
}
