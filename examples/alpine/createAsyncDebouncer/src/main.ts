import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncDebouncer } from '@tanstack/alpine-pacer'
import type { AsyncDebouncerState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineAsyncDebouncer<
    (value: string) => Promise<void>,
    AsyncDebouncerState<(value: string) => Promise<void>>
  > | null,
  init() {
    this.utility = this.scope.createAsyncDebouncer(
      async (value: string) => {
        this.history = [...this.history, value]
      },
      () => ({ wait: this.wait }),
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
