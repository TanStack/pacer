import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncedState } from '@tanstack/ember-pacer'
import type {
  DebouncerState,
  EmberDebouncedState,
  EmberDebouncerOptions,
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
type CounterSelected = DebouncerState<CounterUpdate>

type CounterResult = EmberDebouncedState<CounterValue, CounterSelected>
const counterString = (value: unknown) => String(value)
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
      (useDebouncedState this.instantCount this.select wait=500)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedCount setDebouncedCount debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 1</h1><table><tbody
            ><tr><td>Is Pending:</td><td>{{counterString
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Execution Count:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td
                  colspan={{2}}
                ><hr /></td></tr><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
                >{{debouncedCount}}</td></tr></tbody></table><div><button
              {{on 'click' (fn this.increment result)}}
            >Increment</button></div><pre style='margin-top: 20px'>{{counterJson
              debouncer.state
            }}</pre></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (
  value: SearchValue | ((previous: SearchValue) => SearchValue),
) => void
type SearchSelected = DebouncerState<SearchUpdate>

type SearchResult = EmberDebouncedState<SearchValue, SearchSelected>
const searchString = (value: unknown) => String(value)
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
  enabledOption: NonNullable<
    EmberDebouncerOptions<SearchUpdate, SearchSelected>['enabled']
  > = () => this.instantSearchRef.length > 2
  <template>
    {{#let
      (useDebouncedState
        this.instantSearch this.select wait=500 enabled=this.enabledOption
      )
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedSearch setDebouncedSearch debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' (fn this.handleSearchChange result)}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Is Pending:</td><td>{{searchString
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Execution Count:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td
                  colspan={{2}}
                ><hr /></td></tr><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Debounced Search:</td><td
                >{{debouncedSearch}}</td></tr></tbody></table><pre
            style='margin-top: 20px'
          >{{searchJson debouncer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (
  value: RangeValue | ((previous: RangeValue) => RangeValue),
) => void
type RangeSelected = DebouncerState<RangeUpdate>

type RangeResult = EmberDebouncedState<RangeValue, RangeSelected>
const rangeString = (value: unknown) => String(value)
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked currentValue = 50
  @tracked instantExecutionCount = 0
  handleRangeChange = (result: RangeResult, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    result.setValue(newValue)
  }
  select = (state: RangeSelected) => state
  <template>
    {{#let
      (useDebouncedState this.currentValue this.select wait=250)
      as |result|
    }}{{#let
        result.value result.setValue result.utility
        as |debouncedValue setDebouncedValue debouncer|
      }}<div><h1>TanStack Pacer useDebouncedState Example 3</h1><div
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
          ><label>Debounced Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{debouncedValue}}
                disabled
                style='width: 100%'
              /><span>{{debouncedValue}}</span></label></div><table><tbody><tr
              ><td>Is Pending:</td><td>{{rangeString
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Instant Executions:</td><td
                >{{this.instantExecutionCount}}</td></tr><tr><td>Debounced
                  Executions:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.instantExecutionCount
                    debouncer.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (eq this.instantExecutionCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.instantExecutionCount
                            debouncer.state.executionCount
                          )
                          this.instantExecutionCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Debounced to 250ms wait time</p></div><pre
            style='margin-top: 20px'
          >{{rangeJson debouncer.state}}</pre></div>{{/let}}{{/let}}
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
