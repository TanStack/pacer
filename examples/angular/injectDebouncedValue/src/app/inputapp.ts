import { Component, input } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <h2>Required input</h2>
    <div>value: {{ value() }}</div>
    <div>debounced (no initial): {{ debouncedWithoutInitial() }}</div>
    <div>debounced (with initial): {{ debouncedWithInitial() }}</div>
  `,
})
export class InputApp {
  readonly value = input.required<string>()

  // Required inputs are unavailable during field initialization.
  // This signature avoids reading the input eagerly, so the initial value is undefined.
  readonly debouncedWithoutInitial = injectDebouncedValue(this.value, {
    wait: 500,
  })

  // Provide an initial value to avoid an undefined first read.
  readonly debouncedWithInitial = injectDebouncedValue(this.value, '', {
    wait: 500,
  })
}
