import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type {
  EmberThrottler,
  ThrottlerState,
  EmberThrottlerOptions,
} from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterUtility = EmberThrottler<
  (value: number) => void,
  ThrottlerState<(value: number) => void>
>
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  @tracked instantCount = 0
  @tracked throttledCount = 0
  increment = (utility: CounterUtility) => {
    const nextCount = ++this.instantCount
    utility.maybeExecute(nextCount)
  }
  execute = (value: number) => {
    this.throttledCount = value
  }
  select = (state: ThrottlerState<(value: number) => void>) => state
  flush = (utility: CounterUtility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler this.execute this.select key='counter' wait=1000)
      as |setCountThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 1</h1><table><tbody><tr><td
              >Execution Count:</td><td
              >{{setCountThrottler.state.executionCount}}</td></tr><tr><td
              >Instant Count:</td><td>{{this.instantCount}}</td></tr><tr><td
              >Throttled Count:</td><td
              >{{this.throttledCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment setCountThrottler)}}
          >Increment</button><button
            {{on 'click' (fn this.flush setCountThrottler)}}
            style='margin-left: 10px'
          > Flush </button></div><pre style='margin-top: 20px'>{{counterJson
            setCountThrottler.state
          }}</pre></div>{{/let}}
  </template>
}

type SearchUtility = EmberThrottler<
  (value: string) => void,
  ThrottlerState<(value: string) => void>
>
const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  @tracked instantSearch = ''
  @tracked throttledSearch = ''
  handleSearchChange = (utility: SearchUtility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.instantSearch = newValue
    utility.maybeExecute(newValue)
  }
  execute = (value: string) => {
    this.throttledSearch = value
  }
  select = (state: ThrottlerState<(value: string) => void>) => state
  enabledOption: NonNullable<
    EmberThrottlerOptions<
      (value: string) => void,
      ThrottlerState<(value: string) => void>
    >['enabled']
  > = () => this.instantSearch.length > 2
  flush = (utility: SearchUtility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler
        this.execute
        this.select
        key='search'
        wait=1000
        enabled=this.enabledOption
      )
      as |setSearchThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 2</h1><div><input
            autofocus
            type='search'
            value={{this.instantSearch}}
            {{on 'input' (fn this.handleSearchChange setSearchThrottler)}}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Execution Count:</td><td
              >{{setSearchThrottler.state.executionCount}}</td></tr><tr><td
              >Instant Search:</td><td>{{this.instantSearch}}</td></tr><tr><td
              >Throttled Search:</td><td
              >{{this.throttledSearch}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.flush setSearchThrottler)}}
          >Flush</button></div><pre style='margin-top: 20px'>{{searchJson
            setSearchThrottler.state
          }}</pre></div>{{/let}}
  </template>
}

type RangeUtility = EmberThrottler<
  (value: number) => void,
  ThrottlerState<(value: number) => void>
>
const sub = (a: number, b: number) => a - b
const gt = (a: number, b: number) => a > b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const fixed = (value: number, places: number) => value.toFixed(places)
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked instantExecutionCount = 0
  @tracked currentValue = 50
  @tracked throttledValue = 50
  handleRangeChange = (utility: RangeUtility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    // instant state update
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // throttled state update
    utility.maybeExecute(newValue)
  }
  execute = (value: number) => {
    this.throttledValue = value
  }
  select = (state: ThrottlerState<(value: number) => void>) => state
  flush = (utility: RangeUtility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useThrottler this.execute this.select key='range' wait=250)
      as |setValueThrottler|
    }}<div><h1>TanStack Pacer useThrottler Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange setValueThrottler)}}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Throttled Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.throttledValue}}
              disabled
              style='width: 100%'
            /><span>{{this.throttledValue}}</span></label></div><table><tbody
          ><tr><td>Instant Execution Count:</td><td
              >{{this.instantExecutionCount}}</td></tr><tr><td>Throttled
                Execution Count:</td><td
              >{{setValueThrottler.state.executionCount}}</td></tr><tr><td>Saved
                Executions:</td><td>{{sub
                  this.instantExecutionCount
                  setValueThrottler.state.executionCount
                }}
                ({{if
                  (gt this.instantExecutionCount 0)
                  (fixed
                    (multiply
                      (divide
                        (sub
                          this.instantExecutionCount
                          setValueThrottler.state.executionCount
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
        ><p>Throttled to 1 update per 250ms (trailing edge)</p></div><div
        ><button
            {{on 'click' (fn this.flush setValueThrottler)}}
          >Flush</button></div><pre style='margin-top: 20px'>{{rangeJson
            setValueThrottler.state
          }}</pre></div>{{/let}}
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
