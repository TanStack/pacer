import { Component, signal } from '@angular/core'
import { asyncThrottle } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App {
  readonly searchTerm = signal('')
  readonly executedTerm = signal('')
  readonly results = signal<Array<string>>([])
  readonly loading = signal(false)
  readonly error = signal('')
  readonly runner = asyncThrottle((term: string) => this.search(term), {
    wait: 1000,
  })

  private async search(term: string): Promise<Array<string> | undefined> {
    this.loading.set(true)
    this.executedTerm.set(term)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
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
    await this.runner(value)
  }
}
