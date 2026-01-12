import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { createDebouncedSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly debounced = createDebouncedSignal('', { wait: 500 })
  protected readonly searchTerm = this.debounced[0]
  protected readonly setSearchTerm = this.debounced[1]
}
