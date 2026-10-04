import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimitedState } from '@tanstack/ember-pacer'
import type {
  RateLimiterState,
  EmberRateLimitedState,
  EmberRateLimiterOptions,
  EmberRateLimiter,
} from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterValue = Counter['instantCount']
type CounterUpdate = (
  value: CounterValue | ((previous: CounterValue) => CounterValue),
) => void
type CounterSelected = RateLimiterState

type CounterResult = EmberRateLimitedState<CounterValue, CounterSelected>
const counterEq = (a: unknown, b: unknown) => a === b
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  alert = window.alert.bind(window)
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  increment = (result: CounterResult) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    result.setValue(nextCount)
  }
  select = (state: CounterSelected) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<CounterUpdate, CounterSelected>['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  getRemainingInWindow = (result: CounterResult) => {
    this.alert(result.utility.getRemainingInWindow())
  }
  reset = (result: CounterResult) => {
    this.alert(result.utility.reset())
  }
  <template>
    {{#let
      (useRateLimitedState
        this.instantCount
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |limitedCount setLimitedCount rateLimiter|
      }}<div><h1>TanStack Pacer useRateLimitedState Example 1</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType'
                value='fixed'
                checked={{counterEq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType'
                value='sliding'
                checked={{counterEq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><table><tbody><tr><td>Execution
                  Count:</td><td
                >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                  Count:</td><td
                >{{rateLimiter.state.rejectionCount}}</td></tr><tr><td>Instant
                  Count:</td><td>{{this.instantCount}}</td></tr><tr><td>Rate
                  Limited Count:</td><td
                >{{limitedCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button><button
              {{on 'click' (fn this.getRemainingInWindow result)}}
            > Remaining in Window</button><button
              {{on 'click' (fn this.reset result)}}
            >Reset</button></div><pre style='margin-top: 20px'>{{counterJson
              rateLimiter.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (
  value: SearchValue | ((previous: SearchValue) => SearchValue),
) => void
type SearchSelected = RateLimiterState

type SearchResult = EmberRateLimitedState<SearchValue, SearchSelected>
const searchEq = (a: unknown, b: unknown) => a === b
const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  alert = window.alert.bind(window)
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantSearch = ''
  @tracked instantSearchRef = ''
  handleSearchChange = (result: SearchResult, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    result.setValue(newValue)
  }
  select = (state: SearchSelected) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<SearchUpdate, SearchSelected>['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  getRemainingInWindow = (result: SearchResult) => {
    this.alert(result.utility.getRemainingInWindow())
  }
  reset = (result: SearchResult) => {
    this.alert(result.utility.reset())
  }
  <template>
    {{#let
      (useRateLimitedState
        this.instantSearch
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |limitedSearch setLimitedSearch rateLimiter|
      }}<div><h1>TanStack Pacer useRateLimitedState Example 2</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType2'
                value='fixed'
                checked={{searchEq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType2'
                value='sliding'
                checked={{searchEq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' (fn this.handleSearchChange result)}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Execution Count:</td><td
                >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                  Count:</td><td
                >{{rateLimiter.state.rejectionCount}}</td></tr><tr><td>Instant
                  Search:</td><td>{{this.instantSearch}}</td></tr><tr><td>Rate
                  Limited Search:</td><td
                >{{limitedSearch}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.getRemainingInWindow result)}}
            > Remaining in Window</button><button
              {{on 'click' (fn this.reset result)}}
            >Reset</button></div><pre style='margin-top: 20px'>{{searchJson
              rateLimiter.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (
  value: RangeValue | ((previous: RangeValue) => RangeValue),
) => void
type RangeSelected = RateLimiterState
type Utility = EmberRateLimiter<RangeUpdate, RangeSelected>
type RangeResult = EmberRateLimitedState<RangeValue, RangeSelected>
const rangeEq = (a: unknown, b: unknown) => a === b
const remaining = (utility: Utility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const milliseconds = (utility: Utility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const sub = (a: number, b: number) => a - b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (result: RangeResult, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    result.setValue(newValue)
  }
  select = (state: RangeSelected) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<RangeUpdate, RangeSelected>['onReject']
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
      (useRateLimitedState
        this.currentValue
        this.select
        limit=20
        window=2000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |limitedValue setLimitedValue rateLimiter|
      }}<div><h1>TanStack Pacer useRateLimitedState Example 3</h1><div
            style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
          ><label><input
                type='radio'
                name='windowType3'
                value='fixed'
                checked={{rangeEq this.windowType 'fixed'}}
                {{on 'input' this.useFixedWindow}}
              />Fixed Window</label><label><input
                type='radio'
                name='windowType3'
                value='sliding'
                checked={{rangeEq this.windowType 'sliding'}}
                {{on 'input' this.useSlidingWindow}}
              />Sliding Window</label></div><div
            style='margin-bottom: 20px'
          ><label>Current Range:<input
                type='range'
                min='0'
                max='100'
                value={{this.currentValue}}
                {{on 'input' (fn this.handleRangeChange result)}}
                style='width: 100%'
              /><span>{{this.currentValue}}</span></label></div><div
            style='margin-bottom: 20px'
          ><label>Rate Limited Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{limitedValue}}
                disabled
                style='width: 100%'
              /><span>{{limitedValue}}</span></label></div><table><tbody><tr><td
                >Execution Count:</td><td
                >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                  Count:</td><td
                >{{rateLimiter.state.rejectionCount}}</td></tr><tr><td>Remaining
                  in Window:</td><td>{{remaining rateLimiter}}</td></tr><tr><td
                >Ms Until Next Window:</td><td>{{milliseconds
                    rateLimiter
                  }}</td></tr><tr><td>Instant Executions:</td><td
                >{{this.instantExecutionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.instantExecutionCount
                    rateLimiter.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (rangeEq this.instantExecutionCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.instantExecutionCount
                            rateLimiter.state.executionCount
                          )
                          this.instantExecutionCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Rate limited to 20 updates per 2 seconds</p></div><pre
            style='margin-top: 20px'
          >{{rangeJson rateLimiter.state}}</pre></div>{{/let}}{{/let}}
  </template>
}

export default class Application extends Component {
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    <div><Counter /><hr /><Search /><hr /><Range /></div>
  </template>
}
