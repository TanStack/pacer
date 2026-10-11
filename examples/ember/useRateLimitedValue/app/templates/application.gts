import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useRateLimitedValue } from '@tanstack/ember-pacer'
import type {
  RateLimiterState,
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
type CounterUpdate = (value: CounterValue) => void
type CounterSelected = RateLimiterState

const counterEq = (a: unknown, b: unknown) => a === b
class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
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
  <template>
    {{#let
      (useRateLimitedValue
        this.instantCount
        this.select
        limit=5
        window=5000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let result.value as |limitedCount|}}<div><h1>TanStack Pacer
            useRateLimitedValue Example 1</h1><div
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
              />Sliding Window</label></div><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Rate Limited Count:</td><td
                >{{limitedCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (value: SearchValue) => void
type SearchSelected = RateLimiterState

const searchEq = (a: unknown, b: unknown) => a === b
class Search extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
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
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Rate Limited Search:</td><td
                >{{limitedSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (value: RangeValue) => void
type RangeSelected = RateLimiterState
type Utility = EmberRateLimiter<RangeUpdate, RangeSelected>

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
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked submittedCount = 1
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
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
      (useRateLimitedValue
        this.currentValue
        this.select
        limit=20
        window=2000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |result|
    }}{{#let result.value result.utility as |limitedValue rateLimiter|}}<div><h1
          >TanStack Pacer useRateLimitedValue Example 3</h1><div
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
                {{on 'input' this.handleRangeChange}}
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
                  }}</td></tr><tr><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Saved Executions:</td><td
                >{{sub
                    this.submittedCount
                    rateLimiter.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (rangeEq this.submittedCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.submittedCount rateLimiter.state.executionCount
                          )
                          this.submittedCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Rate limited to 20 updates per 2 seconds</p></div><pre
            style='margin-top: 20px'
          >{{json rateLimiter.state}}</pre></div>{{/let}}{{/let}}
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
