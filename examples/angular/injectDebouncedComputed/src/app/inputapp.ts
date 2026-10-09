import { Component, input } from '@angular/core'
import { injectDebouncedComputed } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-input',
  template: `
    <h2>Required input</h2>
    <div>value: {{ value() }}</div>
    <div>debounced: {{ debounced() }}</div>
  `,
})
export class InputApp {
  readonly value = input.required<string>()
  readonly debounced = injectDebouncedComputed(this.value, { wait: 500 })
}
