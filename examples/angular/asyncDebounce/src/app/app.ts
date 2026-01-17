import { Component, signal } from '@angular/core'
import { createAsyncDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly query = signal('')
  protected readonly logs = signal<Array<string>>([])
  protected readonly debouncer = createAsyncDebouncer(
    async (q: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return `searched: ${q}`
    },
    { wait: 500 },
    (state) => ({ isPending: state.isPending, isExecuting: state.isExecuting }),
  )

  protected async search(value: string): Promise<void> {
    try {
      const result = await this.debouncer.maybeExecute(value)
      if (result !== undefined) {
        this.logs.update((entries) => [result, ...entries])
      }
    } catch (error) {
      this.logs.update((entries) => [`error: ${error}`, ...entries])
    }
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.query.set(target.value)
    void this.search(target.value)
  }

  protected reset(): void {
    this.debouncer.reset()
    this.query.set('')
    this.logs.set([])
  }
}
