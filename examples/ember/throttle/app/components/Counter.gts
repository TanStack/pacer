import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { throttle } from '@tanstack/ember-pacer'

export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked throttledCount = 0
  throttledSetCount = throttle(
    (value: typeof this.throttledCount) => (this.throttledCount = value),
    {
      wait: 1000,
    },
  )
  increment = () => {
    // this pattern helps avoid common bugs with stale closures and state
    this.instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      this.throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(this.instantCount)
  }
  <template>
    <div><h1>TanStack Pacer throttle Example 1</h1><table><tbody><tr><td>Instant
              Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Throttled
              Count:</td><td
            >{{this.throttledCount}}</td></tr></tbody></table><div><button
          {{on 'click' this.increment}}
        >Increment</button></div></div>
  </template>
}
