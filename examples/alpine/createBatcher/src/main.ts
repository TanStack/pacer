import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineBatcher } from '@tanstack/alpine-pacer'
import type { BatcherState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<Array<string>>,
  scope: createPacerScope(),
  utility: null as AlpineBatcher<string, BatcherState<string>> | null,
  init() {
    this.utility = this.scope.createBatcher(
      (value: Array<string>) => {
        this.history = [...this.history, value]
      },
      () => ({ wait: this.wait, maxSize: 3 }),
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
