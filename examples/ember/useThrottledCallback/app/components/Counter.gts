import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledCallback } from '@tanstack/ember-pacer'
import type { EmberThrottlerOptions } from '@tanstack/ember-pacer'

type Execute = Counter['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Counter extends Component {
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  @tracked throttledCount = 0
  increment = (utility: Utility) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    utility(nextCount)
  }
  execute = (value: typeof this.throttledCount) => {
    this.throttledCount = value
  }
  enabledOption: NonNullable<EmberThrottlerOptions<Execute>['enabled']> = () =>
    this.instantCountRef > 2
  <template>
    {{#let
      (useThrottledCallback this.execute wait=1000 enabled=this.enabledOption)
      as |throttledSetCount|
    }}<div><h1>TanStack Pacer useThrottledCallback Example 1</h1><table><tbody
          ><tr><td>Instant Count:</td><td>{{this.instantCount}}</td></tr><tr><td
              >Throttled Count:</td><td
              >{{this.throttledCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment throttledSetCount)}}
          >Increment</button></div></div>{{/let}}
  </template>
}
