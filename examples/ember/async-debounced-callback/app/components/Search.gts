import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncer } from '@tanstack/ember-pacer'
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
    const newCount = this.count + 1
    this.count = newCount
    // Debounced API call
    utility(newCount)
  }
  execute = async (currentValue: number) => {
    const result = await this.incrementApi(currentValue)
    this.count = result
    return result
  }
  <template>
    {{#let
      (useAsyncDebouncer this.execute wait=1000 leading=false trailing=true)
      as |debouncedIncrement|
    }}<div><h1>TanStack Pacer useAsyncDebouncer Example 2</h1><table><tbody><tr
            ><td>Current Count:</td><td>{{this.count}}</td></tr><tr><td>API
                Calls Made:</td><td
              >{{this.apiCallCount}}</td></tr></tbody></table><div><button
            {{on
              'click'
              (fn this.handleIncrement debouncedIncrement.maybeExecute)
            }}
          >Increment (debounced API call)</button></div><p
          style='font-size: 0.9em; color: #666'
        >
          Click rapidly - API calls are debounced to 1 second, but UI updates
          immediately
        </p></div>{{/let}}
  </template>
}
