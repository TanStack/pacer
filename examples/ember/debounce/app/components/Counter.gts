import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { debounce } from '@tanstack/ember-pacer'

export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked debouncedCount = 0
  debouncedSetCount = debounce(
    (value: typeof this.debouncedCount) => (this.debouncedCount = value),
    {
      wait: 500,
      // leading: true, // optional, defaults to false
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  <template>
    <div><h1>TanStack Pacer debounce Example 1</h1><table><tbody><tr><td>Instant
              Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Debounced
              Count:</td><td
            >{{this.debouncedCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}
