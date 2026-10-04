import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncThrottler } from '@tanstack/ember-pacer'
type Execute = Search['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Search extends Component {
  @tracked count = 0
  @tracked apiCallCount = 0
  incrementApi = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newCount = value + 1
    this.apiCallCount = this.apiCallCount + 1
    return newCount
  }
  handleIncrement = (utility: Utility) => {
    // Update local state immediately for instant feedback
    this.count = ((prev) => {
      const newCount = prev + 1
      utility(newCount)
      return newCount
    })(this.count)
  }
  execute = async (currentValue: number) => {
    const result = await this.incrementApi(currentValue)
    this.count = result
    return result
  }
  <template>
    {{#let
      (useAsyncThrottler this.execute wait=1000 leading=true trailing=true)
      as |throttledIncrement|
    }}<div><h1>TanStack Pacer useAsyncThrottler Example 2</h1><table><tbody><tr
            ><td>Current Count:</td><td>{{this.count}}</td></tr><tr><td>API
                Calls Made:</td><td
              >{{this.apiCallCount}}</td></tr></tbody></table><div><button
            {{on
              'click'
              (fn this.handleIncrement throttledIncrement.maybeExecute)
            }}
          >Increment (throttled API call)</button></div><p
          style='font-size: 0.9em; color: #666'
        >
          Click rapidly - API calls are throttled to 1 second, but UI updates
          immediately. First click executes immediately, then at most once per
          second.
        </p></div>{{/let}}
  </template>
}
