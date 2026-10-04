import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'

type Execute = Counter['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  @tracked debouncedCount = 0
  increment = (utility: Utility) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    utility(nextCount)
  }
  execute = (value: typeof this.debouncedCount) => {
    this.debouncedCount = value
  }
  <template>
    {{#let (useDebouncer this.execute wait=500) as |debouncedSetCount|}}<div><h1
        >TanStack Pacer useDebouncer Example 1</h1><table><tbody><tr><td>Instant
                Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Debounced
                Count:</td><td
              >{{this.debouncedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment debouncedSetCount.maybeExecute)}}
          >Increment</button></div></div>{{/let}}
  </template>
}
