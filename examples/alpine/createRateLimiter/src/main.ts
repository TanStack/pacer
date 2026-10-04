import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineRateLimiter } from '@tanstack/alpine-pacer'
import type { RateLimiterState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineRateLimiter<
    (value: string) => void,
    RateLimiterState
  > | null,
  init() {
    this.utility = this.scope.createRateLimiter(
      (value: string) => {
        this.history = [...this.history, value]
      },
      () => ({ limit: 2, window: this.wait }),
      (state) => state,
    )
  },
  schedule() {
    void this.utility?.maybeExecute(this.input)
  },
  burst() {
    for (let i = 1; i <= 3; i++)
      void this.utility?.maybeExecute(`${this.input} ${i}`)
  },
  destroy() {
    this.scope.destroy()
  },
}))
Alpine.start()
