import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineQueuer } from '@tanstack/alpine-pacer'
import type { QueuerState } from '@tanstack/alpine-pacer'
import './style.css'
Alpine.data('example', () => ({
  input: 'hello',
  wait: 200,
  history: [] as Array<string>,
  scope: createPacerScope(),
  utility: null as AlpineQueuer<string, QueuerState<string>> | null,
  init() {
    this.utility = this.scope.createQueuer(
      (value: string) => {
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
