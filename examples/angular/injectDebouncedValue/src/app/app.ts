import { Component, signal } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly query = signal('')

  private readonly debounced = injectDebouncedValue(this.query, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }))

  protected readonly debouncedQuery = this.debounced
  protected readonly debouncer = this.debounced.debouncer

  protected onInput(value: string): void {
    this.query.set(value)
  }

  protected clear(): void {
    this.query.set('')
    this.debouncer.cancel()
  }
}
