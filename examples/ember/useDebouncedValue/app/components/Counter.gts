import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useDebouncedValue } from '@tanstack/ember-pacer'
import type { DebouncerState } from '@tanstack/ember-pacer'

type Value = Counter['instantCount']
type Update = (value: Value) => void
type Selected = DebouncerState<Update>

export default class Counter extends Component {
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  select = (state: Selected) => state
  <template>
    {{#let
      (useDebouncedValue this.instantCount this.select wait=500)
      as |result|
    }}{{#let result.value as |debouncedCount|}}<div><h1>TanStack Pacer
            useDebouncedValue Example 1</h1><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
                >{{debouncedCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}
