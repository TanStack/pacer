import { Component, signal } from '@angular/core'
import { createThrottledValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // Immediate input
  protected readonly instantInput = signal('')

  // Throttled value (500ms) + throttler state
  private readonly _throttle = createThrottledValue(this.instantInput, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }))
  protected readonly throttledInput = this._throttle[0]
  protected readonly throttler = this._throttle[1]

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
