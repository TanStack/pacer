import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useThrottledValue } from '@tanstack/ember-pacer'
import type { ThrottlerState } from '@tanstack/ember-pacer'
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
type CounterSelected = ThrottlerState<CounterUpdate>

class Counter extends Component {
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  select = (state: CounterSelected) => state
  <template>
    {{#let
      (useThrottledValue this.instantCount this.select wait=1000)
      as |result|
    }}{{#let result.value as |throttledCount|}}<div><h1>TanStack Pacer
            useThrottledValue Example 1</h1><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Throttled Count:</td><td
                >{{throttledCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (value: SearchValue) => void
type SearchSelected = ThrottlerState<SearchUpdate>

class Search extends Component {
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  select = (state: SearchSelected) => state
  <template>
    {{#let
      (useThrottledValue this.instantSearch this.select wait=1000)
      as |result|
    }}{{#let result.value as |throttledSearch|}}<div><h1>TanStack Pacer
            useThrottledValue Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Throttled Search:</td><td
                >{{throttledSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (value: RangeValue) => void
type RangeSelected = ThrottlerState<RangeUpdate>

const sub = (a: number, b: number) => a - b
const gt = (a: number, b: number) => a > b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const fixed = (value: number, places: number) => value.toFixed(places)
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked submittedCount = 1
  @tracked currentValue = 50
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  select = (state: RangeSelected) => state
  <template>
    {{#let
      (useThrottledValue this.currentValue this.select wait=250)
      as |result|
    }}{{#let result.value result.utility as |throttledValue throttler|}}<div><h1
          >TanStack Pacer useThrottledValue Example 3</h1><div
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
          ><label>Throttled Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{throttledValue}}
                disabled
                style='width: 100%'
              /><span>{{throttledValue}}</span></label></div><table><tbody><tr
              ><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Throttled Execution
                  Count:</td><td>{{throttler.state.executionCount}}</td></tr><tr
              ><td>Saved Executions:</td><td>{{sub
                    this.submittedCount
                    throttler.state.executionCount
                  }}
                  ({{if
                    (gt this.submittedCount 0)
                    (fixed
                      (multiply
                        (divide
                          (sub
                            this.submittedCount throttler.state.executionCount
                          )
                          this.submittedCount
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
          >{{json throttler.state}}</pre></div>{{/let}}{{/let}}
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
