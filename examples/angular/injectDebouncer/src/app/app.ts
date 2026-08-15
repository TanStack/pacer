import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly query = signal('')
  protected readonly immediateCount = signal(0)
  protected readonly debouncedCount = signal(0)
  protected readonly debouncedValue = signal('')

  protected readonly debouncer = injectDebouncer<
    (value: string) => void,
    { isPending: boolean; executionCount: number; status: string }
  >(
    (value: string) => {
      this.debouncedValue.set(value)
      this.debouncedCount.update((c) => c + 1)
    },
    { wait: 400 },
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
      status: state.status,
    }),
  )

  protected onQueryInput(value: string): void {
    this.query.set(value)
    this.immediateCount.update((c) => c + 1)
    this.debouncer.maybeExecute(value)
  }

  protected flush(): void {
    this.debouncer.flush()
  }

  protected cancel(): void {
    this.debouncer.cancel()
  }

  protected reset(): void {
    this.query.set('')
    this.immediateCount.set(0)
    this.debouncedCount.set(0)
    this.debouncedValue.set('')
    this.debouncer.reset()
  }
}
