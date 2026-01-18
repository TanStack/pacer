import { Component, signal } from '@angular/core'
import { injectRateLimitedSignal } from '@tanstack/angular-pacer'

import type { Signal } from '@angular/core'

type SelectedState = {
  executionCount: number
  rejectionCount: number
}

type RateLimitedSetter = (value: number | ((prev: number) => number)) => void

type RateLimiterHandle = {
  reset: () => void
  state: () => Readonly<SelectedState>
  getRemainingInWindow: () => number
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  readonly rawValue = signal(0)
  readonly limitedValue: Signal<number>
  private readonly setLimitedValue: RateLimitedSetter
  readonly rateLimiter: RateLimiterHandle

  constructor() {
    const [limitedValue, setLimitedValue, rateLimiter] = injectRateLimitedSignal<
      number,
      SelectedState
    >(
      0,
      {
        limit: 3,
        window: 3000,
        windowType: 'sliding',
      },
      (state) => ({
        executionCount: state.executionCount,
        rejectionCount: state.rejectionCount,
      }),
    )

    this.limitedValue = limitedValue
    this.setLimitedValue = setLimitedValue
    this.rateLimiter = {
      reset: rateLimiter.reset.bind(rateLimiter),
      state: rateLimiter.state,
      getRemainingInWindow: rateLimiter.getRemainingInWindow.bind(rateLimiter),
    }
  }

  increment(): void {
    this.rawValue.update((current) => {
      const next = current + 1
      this.setLimitedValue(next)
      return next
    })
  }

  reset(): void {
    this.rateLimiter.reset()
    this.rawValue.set(0)
    this.setLimitedValue(0)
  }

  get executionCount(): number {
    return this.rateLimiter.state().executionCount
  }

  get rejectionCount(): number {
    return this.rateLimiter.state().rejectionCount
  }

  get remainingInWindow(): number {
    return this.rateLimiter.getRemainingInWindow()
  }
}
