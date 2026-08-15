import { Component } from '@angular/core'
import { injectThrottledCallback } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  // Raw event count (increments on every input change)
  rawChanges = 0

  // Throttled count (only increments at most once per 500ms)
  throttledChanges = 0

  // Last value that the throttled callback received
  lastThrottledValue = ''

  // Input value bound from the template
  value = ''

  // Throttled callback for handling "expensive" work
  private readonly handleChangeThrottled = injectThrottledCallback(
    (next: string) => {
      this.throttledChanges++
      this.lastThrottledValue = next
    },
    {
      wait: 500,
      leading: true,
      trailing: true,
    },
  )

  onInput(value: string) {
    this.value = value
    this.rawChanges++
    this.handleChangeThrottled(value)
  }

  reset() {
    this.value = ''
    this.rawChanges = 0
    this.throttledChanges = 0
    this.lastThrottledValue = ''
  }
}
