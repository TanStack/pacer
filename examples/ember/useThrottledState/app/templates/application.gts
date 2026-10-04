import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottledState } from '@tanstack/ember-pacer'
import type { ThrottlerState, EmberThrottledState } from '@tanstack/ember-pacer'
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
type CounterSelected = ThrottlerState<CounterUpdate>

type CounterResult = EmberThrottledState<CounterValue, CounterSelected>
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  increment = (result: CounterResult) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    result.setValue(nextCount)
  }
  select = (state: CounterSelected) => state
  <template>
    {{#let
      (useThrottledState this.instantCount this.select wait=1000)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |throttledCount setThrottledCount throttler|
      }}<div><h1>TanStack Pacer useThrottledState Example 1</h1><table><tbody
            ><tr><td>Execution Count:</td><td
                >{{throttler.state.executionCount}}</td></tr><tr><td>Instant
                  Count:</td><td>{{this.instantCount}}</td></tr><tr><td
                >Throttled Count:</td><td
                >{{throttledCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button></div><pre style='margin-top: 20px'>{{counterJson
              throttler.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (
  value: SearchValue | ((previous: SearchValue) => SearchValue),
) => void
type SearchSelected = ThrottlerState<SearchUpdate>

type SearchResult = EmberThrottledState<SearchValue, SearchSelected>
const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  @tracked instantSearch = ''
  @tracked instantSearchRef = ''
  handleSearchChange = (result: SearchResult, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearchRef = newValue
    this.instantSearch = newValue
    result.setValue(newValue)
  }
  select = (state: SearchSelected) => state
  <template>
    {{#let
      (useThrottledState this.instantSearch this.select wait=1000)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |throttledSearch setThrottledSearch throttler|
      }}<div><h1>TanStack Pacer useThrottledState Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' (fn this.handleSearchChange result)}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Execution Count:</td><td
                >{{throttler.state.executionCount}}</td></tr><tr><td>Instant
                  Search:</td><td>{{this.instantSearch}}</td></tr><tr><td
                >Throttled Search:</td><td
                >{{throttledSearch}}</td></tr></tbody></table><pre
            style='margin-top: 20px'
          >{{searchJson throttler.state}}</pre></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (
  value: RangeValue | ((previous: RangeValue) => RangeValue),
) => void
type RangeSelected = ThrottlerState<RangeUpdate>

type RangeResult = EmberThrottledState<RangeValue, RangeSelected>
const sub = (a: number, b: number) => a - b
const gt = (a: number, b: number) => a > b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const fixed = (value: number, places: number) => value.toFixed(places)
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked instantExecutionCount = 0
  @tracked currentValue = 50
  handleRangeChange = (result: RangeResult, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    result.setValue(newValue)
    this.instantExecutionCount = this.instantExecutionCount + 1
  }
  select = (state: RangeSelected) => state
  <template>
    {{#let
      (useThrottledState this.currentValue this.select wait=250)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |throttledValue setThrottledValue throttler|
      }}<div><h1>TanStack Pacer useThrottledState Example 3</h1><div
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
          ><label>Throttled Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{throttledValue}}
                disabled
                style='width: 100%'
              /><span>{{throttledValue}}</span></label></div><table><tbody><tr
              ><td>Instant Execution Count:</td><td
                >{{this.instantExecutionCount}}</td></tr><tr><td>Throttled
                  Execution Count:</td><td
                >{{throttler.state.executionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.instantExecutionCount
                    throttler.state.executionCount
                  }}
                  ({{if
                    (gt this.instantExecutionCount 0)
                    (fixed
                      (multiply
                        (divide
                          (sub
                            this.instantExecutionCount
                            throttler.state.executionCount
                          )
                          this.instantExecutionCount
                        )
                        100
                      )
                      2
                    )
                    0
                  }}% Reduction in execution calls)
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Throttled to 1 update per 250ms</p></div><pre
            style='margin-top: 20px'
          >{{rangeJson throttler.state}}</pre></div>{{/let}}{{/let}}
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
