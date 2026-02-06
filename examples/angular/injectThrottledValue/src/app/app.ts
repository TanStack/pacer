import { Component, signal } from '@angular/core'
import { injectThrottledValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // Immediate input
  protected readonly instantInput = signal('')

  // Throttled value (500ms) + throttler state
  protected readonly throttled = injectThrottledValue(
    this.instantInput,
    { wait: 500 },
    (state) => ({
      isPending: state.isPending,
    }),
  )
  protected readonly throttler = this.throttled.throttler

  protected onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value
    this.instantInput.set(v)
  }

  protected clear(): void {
    this.instantInput.set('')
  }

  protected hammerInput(): void {
    for (let i = 0; i < 12; i++) {
      this.instantInput.set(`${Date.now()}-${i}`)
    }
  }

  protected cancelPending(): void {
    this.throttler.cancel()
  }
}
