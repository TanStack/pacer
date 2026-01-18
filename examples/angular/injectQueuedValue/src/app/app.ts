import { Component, signal } from '@angular/core';
import { injectDebouncedSignal } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly source = signal('');

  protected readonly debounced = injectDebouncedSignal('', { wait: 500 }, (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
  }));

  protected onInput(value: string): void {
    this.source.set(value);
    this.debounced.setValue(value);
  }

  protected setRandom(): void {
    const value = Math.random().toFixed(4);
    this.source.set(value);
    this.debounced.setValue(value);
  }

  protected clear(): void {
    this.source.set('');
    this.debounced.setValue('');
  }
}
