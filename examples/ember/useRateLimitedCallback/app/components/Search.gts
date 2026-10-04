import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedCallback } from '@tanstack/ember-pacer'
import type { EmberRateLimiterOptions } from '@tanstack/ember-pacer'

type Execute = Search['execute']
type Utility = (...args: Parameters<Execute>) => unknown
const eq = (a: unknown, b: unknown) => a === b
export default class Search extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked searchText = ''
  @tracked searchTextRef = ''
  @tracked rateLimitedSearchText = ''
  handleSearchChange = (utility: Utility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    utility(newValue)
  }
  execute = (value: typeof this.rateLimitedSearchText) => {
    this.rateLimitedSearchText = value
  }
  enabledOption: NonNullable<EmberRateLimiterOptions<Execute>['enabled']> =
    () => this.searchTextRef.length > 2
  onRejectOption: NonNullable<EmberRateLimiterOptions<Execute>['onReject']> = (
    rateLimiter,
  ) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimitedCallback
        this.execute
        limit=5
        window=5000
        windowType=this.windowType
        enabled=this.enabledOption
        onReject=this.onRejectOption
      )
      as |rateLimitedSetSearch|
    }}<div><h1>TanStack Pacer useRateLimitedCallback Example 2</h1><div
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
            value={{this.searchText}}
            {{on 'input' (fn this.handleSearchChange rateLimitedSetSearch)}}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>RateLimited Search:</td><td
              >{{this.rateLimitedSearchText}}</td></tr></tbody></table></div>{{/let}}
  </template>
}
