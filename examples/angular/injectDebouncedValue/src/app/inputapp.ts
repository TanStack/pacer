import { Component, input } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <h1>NG0950</h1>
    <div>value: {{ value() }}</div>
    <div>debounced (no initial): {{ debouncedWithoutInitial() }}</div>
    <div>debounced (with initial): {{ debouncedWithInitial() }}</div>
  `,
})
export class InputApp {
  readonly value = input.required<string>()

  // Example of NG0950
  // with an input signal during field initialization can run before inputs are ready.
  // This signature avoids reading the input eagerly, so the initial value is undefined.
  readonly debouncedWithoutInitial = injectDebouncedValue(this.value, { wait: 500 })

  // Provide an initial value to avoid an undefined first read.
  readonly debouncedWithInitial = injectDebouncedValue(this.value, '', { wait: 500 })
}
