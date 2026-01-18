import { Component, signal } from '@angular/core';
import { injectDebouncedValue } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly query = signal('');

  private readonly setup = injectDebouncedValue(this.query, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }));

  protected readonly debouncedQuery = this.setup[0];
  protected readonly debouncer = this.setup[1];

  protected onInput(value: string): void {
    this.query.set(value);
  }

  protected clear(): void {
    this.query.set('');
    this.debouncer.cancel();
  }
}
