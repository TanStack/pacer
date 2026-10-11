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
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterUtility = EmberRateLimiter<
  (value: number) => void,
  RateLimiterState
>
const counterEq = (a: unknown, b: unknown) => a === b
const counterRemaining = (utility: CounterUtility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const counterMilliseconds = (utility: CounterUtility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked limitedCount = 0
  increment = (utility: CounterUtility) => {
    const nextCount = ++this.instantCount
    utility.maybeExecute(nextCount)
  }
  execute = (value: number) => {
    this.limitedCount = value
  }
  select = (state: RateLimiterState) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<
      (value: number) => void,
      RateLimiterState
    >['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  setFixedWindow = () => {
    this.windowType = 'fixed'
  }
  setSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  reset = (utility: CounterUtility) => {
    utility.reset()
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        this.select
        key='counter'
        limit=this.commonRateLimiterOptions.limit
        window=this.commonRateLimiterOptions.window
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |rateLimiter|
    }}<div><h1>TanStack Pacer useRateLimiter Example 1</h1><div
          style='display: grid; gap: 0.5rem; margin-bottom: 1rem'
        ><label><input
              type='radio'
              name='windowType'
              value='fixed'
              checked={{counterEq this.windowType 'fixed'}}
              {{on 'input' this.setFixedWindow}}
            />Fixed Window</label><label><input
              type='radio'
              name='windowType'
              value='sliding'
              checked={{counterEq this.windowType 'sliding'}}
              {{on 'input' this.setSlidingWindow}}
            />Sliding Window</label></div><table><tbody><tr><td>Execution Count:</td><td
              >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                Count:</td><td>{{rateLimiter.state.rejectionCount}}</td></tr><tr
            ><td>Remaining in Window:</td><td>{{counterRemaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td
              >{{counterMilliseconds rateLimiter}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Count:</td><td
              >{{this.instantCount}}</td></tr><tr><td>Rate Limited Count:</td><td
              >{{this.limitedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment rateLimiter)}}
          >Increment</button><button
            {{on 'click' (fn this.reset rateLimiter)}}
          >Reset</button></div><pre style='margin-top: 20px'>{{counterJson
            rateLimiter.state
          }}</pre></div>{{/let}}
  </template>
}

type SearchUtility = EmberRateLimiter<(value: string) => void, RateLimiterState>
const searchRemaining = (utility: SearchUtility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const searchMilliseconds = (utility: SearchUtility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  @tracked instantSearch = ''
  @tracked limitedSearch = ''
  handleSearchChange = (utility: SearchUtility, e: Event) => {
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
  reset = (utility: SearchUtility) => {
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
            ><td>Remaining in Window:</td><td>{{searchRemaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td
              >{{searchMilliseconds rateLimiter}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Search:</td><td
              >{{this.instantSearch}}</td></tr><tr><td>Rate Limited Search:</td><td
              >{{this.limitedSearch}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.reset rateLimiter)}}
          >Reset</button></div><pre style='margin-top: 20px'>{{searchJson
            rateLimiter.state
          }}</pre></div>{{/let}}
  </template>
}

type RangeUtility = EmberRateLimiter<(value: number) => void, RateLimiterState>
const rangeRemaining = (utility: RangeUtility) => {
  void utility.state
  return utility.getRemainingInWindow()
}
const rangeMilliseconds = (utility: RangeUtility) => {
  void utility.state
  return utility.getMsUntilNextWindow()
}
const sub = (a: number, b: number) => a - b
const rangeEq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked currentValue = 50
  @tracked limitedValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (utility: RangeUtility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    utility.maybeExecute(newValue)
  }
  execute = (value: number) => {
    this.limitedValue = value
  }
  select = (state: RateLimiterState) => state
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<
      (value: number) => void,
      RateLimiterState
    >['onReject']
  > = (rateLimiter) =>
    console.log('Rejected by rate limiter', rateLimiter.getMsUntilNextWindow())
  <template>
    {{#let
      (useRateLimiter
        this.execute
        this.select
        key='range'
        limit=20
        window=2000
        onReject=this.onRejectOption
      )
      as |rateLimiter|
    }}<div><h1>TanStack Pacer useRateLimiter Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange rateLimiter)}}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Rate Limited Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.limitedValue}}
              disabled
              style='width: 100%'
            /><span>{{this.limitedValue}}</span></label></div><table><tbody><tr
            ><td>Execution Count:</td><td
              >{{rateLimiter.state.executionCount}}</td></tr><tr><td>Rejection
                Count:</td><td>{{rateLimiter.state.rejectionCount}}</td></tr><tr
            ><td>Remaining in Window:</td><td>{{rangeRemaining
                  rateLimiter
                }}</td></tr><tr><td>Ms Until Next Window:</td><td
              >{{rangeMilliseconds rateLimiter}}</td></tr><tr><td>Instant
                Executions:</td><td>{{this.instantExecutionCount}}</td></tr><tr
            ><td>Saved Executions:</td><td>{{sub
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
        >{{rangeJson rateLimiter.state}}</pre></div>{{/let}}
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
