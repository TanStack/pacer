import { Component, input } from '@angular/core';
import { injectDebouncedValue } from '@tanstack/angular-pacer';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <h2>Required input</h2>
    <div>value: {{ value() }}</div>
    <div>debounced: {{ debouncedWithoutInitial() }}</div>
  `,
})
export class InputApp {
  readonly value = input.required<string>();

  // Required inputs are unavailable during field initialization.
  // The helper initializes lazily from the source after Angular binds it.
  readonly debouncedWithoutInitial = injectDebouncedValue(this.value, {
    wait: 500,
  });
}
