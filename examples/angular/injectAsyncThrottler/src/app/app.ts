import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectAsyncThrottler } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly searchTerm = signal('')
  readonly results = signal<Array<string>>([])
  readonly loading = signal(false)
  readonly error = signal('')
  readonly runner = injectAsyncThrottler(
    (term: string) => this.search(term),
    () => ({
      wait: 1000,
      onError: (error) => {
        this.error.set(error.message)
        this.results.set([])
      },
    }),
    (state) => state,
  )

  private async search(term: string): Promise<Array<string> | undefined> {
    if (!term) {
      this.results.set([])
      return
    }
    this.loading.set(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const results = [1, 2, 3].map((id) => `Result ${id} for ${term}`)
      this.results.set(results)
      this.error.set('')
      return results
    } finally {
      this.loading.set(false)
    }
  }
  async onSearch(value: string): Promise<void> {
    this.searchTerm.set(value)
    await this.runner.maybeExecute(value)
  }
}
