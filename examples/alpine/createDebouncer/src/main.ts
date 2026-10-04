import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineDebouncer } from '@tanstack/alpine-pacer'
import type { DebouncerState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineDebouncer<
    (value: string) => void,
    DebouncerState<(value: string) => void>
  > | null,
  init() {
    this.utility = this.scope.createDebouncer(
      (value: string) => {
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
