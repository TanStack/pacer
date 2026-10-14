import { Component, input } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

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
  readonly debounced = injectDebouncedValue(this.value, { wait: 500 })
}
