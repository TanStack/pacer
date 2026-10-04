import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { throttle } from '@tanstack/ember-pacer'

export default class Search extends Component {
  @tracked text = ''
  @tracked throttledText = ''
  throttledSetText = throttle(
    (value: typeof this.throttledText) => (this.throttledText = value),
    {
      wait: 1000,
    },
  )
  handleTextChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.text = newValue
    this.throttledSetText(newValue)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 2</h1><div><input
          type='search'
          value={{this.text}}
          {{on 'input' this.handleTextChange}}
          placeholder='Type text (throttled to 1 update per second)...'
          style='width: 100%'
        /></div><table><tbody><tr><td>Instant Text:</td><td
            >{{this.text}}</td></tr><tr><td>Throttled Text:</td><td
            >{{this.throttledText}}</td></tr></tbody></table></div>
  </template>
}
