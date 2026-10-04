import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useThrottler } from '@tanstack/ember-pacer'
import type { EmberThrottlerOptions } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterExecute = Counter['execute']
type CounterUtility = (...args: Parameters<CounterExecute>) => unknown

class Counter extends Component {
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  @tracked throttledCount = 0
  increment = (utility: CounterUtility) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    utility(nextCount)
  }
  execute = (value: typeof this.throttledCount) => {
    this.throttledCount = value
  }
  enabledOption: NonNullable<EmberThrottlerOptions<CounterExecute>['enabled']> =
    () => this.instantCountRef > 2
  <template>
    {{#let
      (useThrottler this.execute wait=1000 enabled=this.enabledOption)
      as |throttledSetCount|
    }}<div><h1>TanStack Pacer useThrottler Example 1</h1><table><tbody><tr><td
              >Instant Count:</td><td>{{this.instantCount}}</td></tr><tr><td
              >Throttled Count:</td><td
              >{{this.throttledCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment throttledSetCount.maybeExecute)}}
          >Increment</button></div></div>{{/let}}
  </template>
}

type SearchExecute = Search['execute']
type SearchUtility = (...args: Parameters<SearchExecute>) => unknown

class Search extends Component {
  @tracked searchText = ''
  @tracked searchTextRef = ''
  @tracked throttledSearchText = ''
  handleSearchChange = (utility: SearchUtility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    utility(newValue)
  }
  execute = (value: typeof this.throttledSearchText) => {
    this.throttledSearchText = value
  }
  enabledOption: NonNullable<EmberThrottlerOptions<SearchExecute>['enabled']> =
    () => this.searchTextRef.length > 2
  <template>
    {{#let
      (useThrottler this.execute wait=1000 enabled=this.enabledOption)
      as |throttledSetSearch|
    }}<div><h1>TanStack Pacer useThrottler Example 2</h1><div><input
            type='search'
            value={{this.searchText}}
            {{on
              'input'
              (fn this.handleSearchChange throttledSetSearch.maybeExecute)
            }}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>Throttled Search:</td><td
              >{{this.throttledSearchText}}</td></tr></tbody></table></div>{{/let}}
  </template>
}

type RangeExecute = Range['execute']
type RangeUtility = (...args: Parameters<RangeExecute>) => unknown

class Range extends Component {
  @tracked currentValue = 50
  @tracked throttledValue = 50
  handleRangeChange = (utility: RangeUtility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    utility(newValue)
  }
  execute = (value: typeof this.throttledValue) => {
    this.throttledValue = value
  }
  <template>
    {{#let (useThrottler this.execute wait=250) as |throttledSetValue|}}<div><h1
        >TanStack Pacer useThrottler Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on
                'input'
                (fn this.handleRangeChange throttledSetValue.maybeExecute)
              }}
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
            /><span>{{this.throttledValue}}</span></label></div><div
          style='color: #666; font-size: 0.9em'
        ><p>Throttled to 1 update per 250ms</p></div></div>{{/let}}
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
