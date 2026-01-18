import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectDebouncedSignal } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly instantValue = signal('');

  protected readonly debounced = injectDebouncedSignal('', { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }));

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.instantValue.set(value);
    this.debounced.setValue(value);
  }

  protected clear(): void {
    this.instantValue.set('');
    this.debounced.debouncer.cancel();
    this.debounced.setValue('');
    this.debounced.debouncer.flush();
  }

  protected cancelPending(): void {
    this.debounced.debouncer.cancel();
  }
}
