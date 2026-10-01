import { Component, signal } from '@angular/core'
import { asyncRateLimit } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App {
  readonly searchTerm = signal('')
  readonly executedTerm = signal('')
  readonly results = signal<Array<string>>([])
  readonly loading = signal(false)
  readonly error = signal('')
  readonly windowType = signal<'fixed' | 'sliding'>('fixed')
  runner = this.createRunner()
  private createRunner() {
    return asyncRateLimit((term: string) => this.search(term), {
      limit: 5,
      window: 5000,
      windowType: this.windowType(),
      onReject: (_args, limiter) =>
        console.log(`Rate limit reached. Try again in ${limiter.getMsUntilNextWindow()}ms`),
    })
  }

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
  changeWindow(value: 'fixed' | 'sliding'): void {
    this.windowType.set(value)
    this.runner = this.createRunner()
  }
}
