import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineThrottler } from '@tanstack/alpine-pacer'
import type { ThrottlerState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineThrottler<
    (value: string) => void,
    ThrottlerState<(value: string) => void>
  > | null,
  init() {
    this.utility = this.scope.createThrottler(
      (value: string) => {
        this.history = [...this.history, value]
      },
      () => ({ wait: this.wait, leading: false }),
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
