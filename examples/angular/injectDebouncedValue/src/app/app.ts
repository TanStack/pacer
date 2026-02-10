import { Component, signal } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'
import { JsonPipe } from '@angular/common'
import { InputApp } from './inputapp'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [InputApp, JsonPipe],
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
