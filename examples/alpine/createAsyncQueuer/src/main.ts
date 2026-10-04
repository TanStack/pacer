import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncQueuer } from '@tanstack/alpine-pacer'
import type { AsyncQueuerState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineAsyncQueuer<string, AsyncQueuerState<string>> | null,
  init() {
    this.utility = this.scope.createAsyncQueuer(
      async (value: string) => {
        this.history = [...this.history, value]
      },
      () => ({ wait: this.wait, started: false }),
      (state) => state,
    )
  },
  schedule() {
    void this.utility?.addItem(this.input)
  },
  burst() {
    for (let i = 1; i <= 3; i++)
      void this.utility?.addItem(`${this.input} ${i}`)
  },
  destroy() {
    this.scope.destroy()
  },
}))
Alpine.start()
