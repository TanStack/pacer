import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useDebouncer } from '@tanstack/ember-pacer'
import type { DebouncerState, EmberDebouncer } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  @tracked instantCount = 0
  @tracked debouncedCount = 0
  execute = (value: number) => {
    this.debouncedCount = value
  }
  select = (state: DebouncerState<(value: number) => void>) => state
  canExecute = () => this.instantCount > 2
  increment = (
    debouncer: Pick<EmberDebouncer<(value: number) => void>, 'maybeExecute'>,
  ) => {
    this.instantCount++
    debouncer.maybeExecute(this.instantCount)
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='counter' wait=800 enabled=this.canExecute
      )
      as |debouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 1</h1><table><tbody><tr><td
              >Status:</td><td>{{debouncer.state.status}}</td></tr><tr><td
              >Execution Count:</td><td
              >{{debouncer.state.executionCount}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Count:</td><td
              >{{this.instantCount}}</td></tr><tr><td>Debounced Count:</td><td
              >{{this.debouncedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment debouncer)}}
          >Increment</button><button
            {{on 'click' debouncer.flush}}
            style='margin-left: 10px'
          >Flush</button></div><pre style='margin-top: 20px'>{{counterJson
            debouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}

const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
const searchString = (value: unknown) => String(value)
class Search extends Component {
  @tracked searchText = ''
  @tracked debouncedSearchText = ''
  execute = (value: string) => {
    this.debouncedSearchText = value
  }
  select = (state: DebouncerState<(value: string) => void>) => state
  canExecute = () => this.searchText.length > 2
  handleSearchChange = (
    debouncer: Pick<EmberDebouncer<(value: string) => void>, 'maybeExecute'>,
    event: Event,
  ) => {
    this.searchText = (event.target as HTMLInputElement).value
    debouncer.maybeExecute(this.searchText)
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='search' wait=500 enabled=this.canExecute
      )
      as |setSearchDebouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 2</h1><div><input
            autofocus
            type='search'
            value={{this.searchText}}
            {{on 'input' (fn this.handleSearchChange setSearchDebouncer)}}
            placeholder='Type to search...'
            style='width: 100%; margin-bottom: 1rem'
          /></div><table><tbody><tr><td>Is Pending:</td><td>{{searchString
                  setSearchDebouncer.state.isPending
                }}</td></tr><tr><td>Execution Count:</td><td
              >{{setSearchDebouncer.state.executionCount}}</td></tr><tr><td
                colspan={{2}}
              ><hr /></td></tr><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>Debounced Search:</td><td
              >{{this.debouncedSearchText}}</td></tr></tbody></table><div
        ><button
            {{on 'click' setSearchDebouncer.flush}}
          >Flush</button></div><pre style='margin-top: 20px'>{{searchJson
            setSearchDebouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}

const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
const rangeString = (value: unknown) => String(value)
const subtract = (a: number, b: number) => a - b
const reduction = (instant: number, executed: number) =>
  instant === 0 ? 0 : Math.round(((instant - executed) / instant) * 100)
class Range extends Component {
  @tracked currentValue = 50
  @tracked debouncedValue = 50
  @tracked instantExecutionCount = 0
  @tracked wait = 250
  @tracked enabled = true
  execute = (value: number) => {
    this.debouncedValue = value
  }
  select = (state: DebouncerState<(value: number) => void>) => state
  handleRangeChange = (
    debouncer: Pick<EmberDebouncer<(value: number) => void>, 'maybeExecute'>,
    event: Event,
  ) => {
    this.currentValue = Number((event.target as HTMLInputElement).value)
    this.instantExecutionCount++
    debouncer.maybeExecute(this.currentValue)
  }
  updateWait = (event: Event) => {
    this.wait = (event.target as HTMLInputElement).valueAsNumber
  }
  updateEnabled = (event: Event) => {
    this.enabled = (event.target as HTMLInputElement).checked
  }

  <template>
    {{#let
      (useDebouncer
        this.execute this.select key='range' wait=this.wait enabled=this.enabled
      )
      as |setValueDebouncer|
    }}
      <div><h1>TanStack Pacer useDebouncer Example 3</h1><fieldset><legend
          >Reactive options</legend><label>Delay:
            {{this.wait}}
            ms<input
              type='range'
              min='0'
              max='1500'
              step='50'
              value={{this.wait}}
              {{on 'input' this.updateWait}}
            /></label><label><input
              type='checkbox'
              checked={{this.enabled}}
              {{on 'input' this.updateEnabled}}
            />Enabled</label><p>Changing the delay affects the next scheduled
            call. Disabling cancels pending work.</p></fieldset><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange setValueDebouncer)}}
              style='width: 100%'
            /><span>{{this.currentValue}}</span></label></div><div
          style='margin-bottom: 20px'
        ><label>Debounced Range (Readonly):<input
              type='range'
              min='0'
              max='100'
              value={{this.debouncedValue}}
              disabled
              style='width: 100%'
            /><span>{{this.debouncedValue}}</span></label></div><table><tbody
          ><tr><td>Is Pending:</td><td>{{rangeString
                  setValueDebouncer.state.isPending
                }}</td></tr><tr><td>Instant Executions:</td><td
              >{{this.instantExecutionCount}}</td></tr><tr><td>Debounced
                Executions:</td><td
              >{{setValueDebouncer.state.executionCount}}</td></tr><tr><td>Saved
                Executions:</td><td>{{subtract
                  this.instantExecutionCount
                  setValueDebouncer.state.executionCount
                }}</td></tr><tr><td>% Reduction:</td><td>{{reduction
                  this.instantExecutionCount
                  setValueDebouncer.state.executionCount
                }}%</td></tr></tbody></table><div
          style='color: #666; font-size: 0.9em'
        ><p>Debounced to {{this.wait}}ms wait time</p></div><div><button
            {{on 'click' setValueDebouncer.flush}}
          >Flush</button></div><pre style='margin-top: 20px'>{{rangeJson
            setValueDebouncer.state
          }}</pre></div>
    {{/let}}
  </template>
}

export default class App extends Component {
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
