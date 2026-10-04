import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimiter, rateLimiterOptions } from '@tanstack/ember-pacer'
import type {
  EmberRateLimiter,
  RateLimiterState,
  EmberRateLimiterOptions,
} from '@tanstack/ember-pacer'

type Utility = EmberRateLimiter<(value: string) => void, RateLimiterState>
const remaining = (utility: Utility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const milliseconds = (utility: Utility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Search extends Component {
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  @tracked instantSearch = ''
  @tracked limitedSearch = ''
  handleSearchChange = (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearch = newValue
    utility.maybeExecute(newValue)
  }
  execute = (value: string) => {
    this.limitedSearch = value
  }
  select = (state: RateLimiterState) => state
  enabledOption: NonNullable<
    EmberRateLimiterOptions<
      (value: string) => void,
      RateLimiterState
    >['enabled']
  > = () => this.instantSearch.length > 2
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<
      (value: string) => void,
      RateLimiterState
    >['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  reset = (utility: Utility) => {
    utility.reset()
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        this.select
        key='search'
        enabled=this.enabledOption
        limit=this.commonRateLimiterOptions.limit
        window=this.commonRateLimiterOptions.window
        onReject=this.onRejectOption
      )
      as |rateLimiter|
    }}<div><h1>TanStack Pacer useRateLimiter Example 2</h1><div><input
            autofocus
            type='search'
            value={{this.instantSearch}}
            {{on 'input' (fn this.handleSearchChange rateLimiter)}}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Execution Count:</td><td
              >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                Count:</td><td>{{rateLimiter.state.rejectionCount}}</td></tr><tr
            ><td>Remaining in Window:</td><td>{{remaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td>{{milliseconds
                  rateLimiter
                }}</td></tr><tr><td colspan={{2}}><hr /></td></tr><tr><td
              >Instant Search:</td><td>{{this.instantSearch}}</td></tr><tr><td
              >Rate Limited Search:</td><td
              >{{this.limitedSearch}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.reset rateLimiter)}}
          >Reset</button></div><pre style='margin-top: 20px'>{{json
            rateLimiter.state
          }}</pre></div>{{/let}}
  </template>
}
