import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { useDebouncedValue } from '@tanstack/ember-pacer'
import type { DebouncerState } from '@tanstack/ember-pacer'
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
type CounterSelected = DebouncerState<CounterUpdate>

class Counter extends Component {
  @tracked instantCount = 0
  increment = () => {
    this.instantCount = this.instantCount + 1
  }
  select = (state: CounterSelected) => state
  <template>
    {{#let
      (useDebouncedValue this.instantCount this.select wait=500)
      as |result|
    }}{{#let result.value as |debouncedCount|}}<div><h1>TanStack Pacer
            useDebouncedValue Example 1</h1><table><tbody><tr><td>Instant Count:</td><td
                >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
                >{{debouncedCount}}</td></tr></tbody></table><div><button
              {{on 'click' this.increment}}
            >Increment</button></div></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['instantSearch']
type SearchUpdate = (value: SearchValue) => void
type SearchSelected = DebouncerState<SearchUpdate>

class Search extends Component {
  @tracked instantSearch = ''
  handleSearchChange = (e: Event) => {
    this.instantSearch = (e.target as HTMLInputElement).value
  }
  select = (state: SearchSelected) => state
  get enabledOption() {
    return this.instantSearch.length > 2
  }
  <template>
    {{#let
      (useDebouncedValue
        this.instantSearch this.select wait=500 enabled=this.enabledOption
      )
      as |result|
    }}{{#let result.value as |debouncedSearch|}}<div><h1>TanStack Pacer
            useDebouncedValue Example 2</h1><div><input
              type='search'
              value={{this.instantSearch}}
              {{on 'input' this.handleSearchChange}}
              placeholder='Type to search...'
              style='width: 100%'
            /></div><table><tbody><tr><td>Instant Search:</td><td
                >{{this.instantSearch}}</td></tr><tr><td>Debounced Search:</td><td
                >{{debouncedSearch}}</td></tr></tbody></table></div>{{/let}}{{/let}}
  </template>
}

type RangeValue = Range['currentValue']
type RangeUpdate = (value: RangeValue) => void
type RangeSelected = DebouncerState<RangeUpdate>

const string = (value: unknown) => String(value)
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked currentValue = 50
  @tracked submittedCount = 1
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  select = (state: RangeSelected) => state
  <template>
    {{#let
      (useDebouncedValue this.currentValue this.select wait=250)
      as |result|
    }}{{#let result.value result.utility as |debouncedValue debouncer|}}<div><h1
          >TanStack Pacer useDebouncedValue Example 3</h1><div
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
          ><label>Debounced Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{debouncedValue}}
                disabled
                style='width: 100%'
              /><span>{{debouncedValue}}</span></label></div><table><tbody><tr
              ><td>Is Pending:</td><td>{{string
                    debouncer.state.isPending
                  }}</td></tr><tr><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Debounced Executions:</td><td
                >{{debouncer.state.executionCount}}</td></tr><tr><td>Saved
                  Executions:</td><td>{{sub
                    this.submittedCount
                    debouncer.state.executionCount
                  }}</td></tr><tr><td>% Reduction:</td><td>{{#if
                    (eq this.submittedCount 0)
                  }}0{{else}}{{round
                      (multiply
                        (divide
                          (sub
                            this.submittedCount debouncer.state.executionCount
                          )
                          this.submittedCount
                        )
                        100
                      )
                    }}{{/if}}%
                </td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Debounced to 250ms wait time</p></div><pre
            style='margin-top: 20px'
          >{{json debouncer.state}}</pre></div>{{/let}}{{/let}}
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
