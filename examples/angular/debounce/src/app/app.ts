import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { createDebouncedSignal } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Debouncer example
  protected readonly debounced = createDebouncedSignal<string, { isPending: boolean }>(
    '',
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  );
  protected readonly searchTerm = this.debounced.value;
  protected readonly setSearchTerm = this.debounced.setValue;
}
