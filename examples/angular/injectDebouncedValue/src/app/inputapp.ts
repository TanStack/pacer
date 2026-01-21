import { Component, input } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-problem',
  standalone: true,
  template: `
    <h1>PROBLEM</h1>
    <div>value: {{ value() }}</div>
    <div>debounced: {{ debounced() }}</div>
  `,
})
export class InputApp {
  readonly value = input.required<string>()

  // Example of NG0950
  // with an input signal during field initialization can run before inputs are ready.
  readonly debounced = injectDebouncedValue(this.value, { wait: 500 })
}
