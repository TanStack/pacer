import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectDebouncedSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  // Debouncer example
  protected readonly debounced = injectDebouncedSignal<string, { isPending: boolean }>(
    '',
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  )
  protected readonly searchTerm = this.debounced
  protected readonly setSearchTerm = this.debounced.set
}
