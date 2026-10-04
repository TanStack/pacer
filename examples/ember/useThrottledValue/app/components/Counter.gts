import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useThrottledValue } from '@tanstack/ember-pacer'
import type { ThrottlerState } from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value) => void
type Selected = ThrottlerState<Update>

export default class Counter extends Component {
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useThrottledValue this.instantCount this.select wait=1000)
      as |result|
    }}{{#let result.value as |throttledCount|}}<div><h1>TanStack Pacer
            useThrottledValue Example 1</h1><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Throttled Count:</td><td
                >{{throttledCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}
