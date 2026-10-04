import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'

import { useRateLimitedValue } from '@tanstack/ember-pacer'
import type {
  RateLimiterState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Value = Search['instantSearch']
type Update = (value: Value) => void
type Selected = RateLimiterState

const eq = (a: unknown, b: unknown) => a === b
export default class Search extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  select = (state: Selected) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<Update, Selected>['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimitedValue
        this.instantSearch
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let result.value as |limitedSearch|}}<div><h1>TanStack Pacer
            useRateLimitedValue Example 2</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType2'
                value='fixed'
                checked={{eq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType2'
                value='sliding'
                checked={{eq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Rate Limited Search:</td><td
                >{{limitedSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}
