import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useRateLimiter } from '@tanstack/ember-pacer'
import type { EmberRateLimiterOptions } from '@tanstack/ember-pacer'
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
const counterEq = (a: unknown, b: unknown) => a === b
class Counter extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked instantCount = 0
  @tracked instantCountRef = 0
  @tracked rateLimitedCount = 0
  increment = (utility: CounterUtility) => {
    const nextCount = ++this.instantCountRef
    this.instantCount = nextCount
    utility(nextCount)
  }
  execute = (value: typeof this.rateLimitedCount) => {
    this.rateLimitedCount = value
  }
  enabledOption: NonNullable<
    EmberRateLimiterOptions<CounterExecute>['enabled']
  > = () => this.instantCountRef > 2
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<CounterExecute>['onReject']
  > = (rateLimiter) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        limit=5
        window=5000
        windowType=this.windowType
        enabled=this.enabledOption
        onReject=this.onRejectOption
      )
      as |rateLimitedSetCount|
    }}<div><h1>TanStack Pacer useRateLimiter Example 1</h1><div
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
              >{{this.instantCount}}</td></tr><tr><td>RateLimited Count:</td><td
              >{{this.rateLimitedCount}}</td></tr></tbody></table><div><button
            {{on 'click' (fn this.increment rateLimitedSetCount.maybeExecute)}}
          >Increment</button></div></div>{{/let}}
  </template>
}

type SearchExecute = Search['execute']
type SearchUtility = (...args: Parameters<SearchExecute>) => unknown
const searchEq = (a: unknown, b: unknown) => a === b
class Search extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked searchText = ''
  @tracked searchTextRef = ''
  @tracked rateLimitedSearchText = ''
  handleSearchChange = (utility: SearchUtility, e: Event) => {
    const newValue = (e.target as HTMLInputElement).value
    this.searchTextRef = newValue
    this.searchText = newValue
    utility(newValue)
  }
  execute = (value: typeof this.rateLimitedSearchText) => {
    this.rateLimitedSearchText = value
  }
  enabledOption: NonNullable<
    EmberRateLimiterOptions<SearchExecute>['enabled']
  > = () => this.searchTextRef.length > 2
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<SearchExecute>['onReject']
  > = (rateLimiter) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        limit=5
        window=5000
        windowType=this.windowType
        enabled=this.enabledOption
        onReject=this.onRejectOption
      )
      as |rateLimitedSetSearch|
    }}<div><h1>TanStack Pacer useRateLimiter Example 2</h1><div
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
            value={{this.searchText}}
            {{on
              'input'
              (fn this.handleSearchChange rateLimitedSetSearch.maybeExecute)
            }}
            placeholder='Type to search...'
            style='width: 100%'
          /></div><table><tbody><tr><td>Instant Search:</td><td
              >{{this.searchText}}</td></tr><tr><td>RateLimited Search:</td><td
              >{{this.rateLimitedSearchText}}</td></tr></tbody></table></div>{{/let}}
  </template>
}

type RangeExecute = Range['execute']
type RangeUtility = (...args: Parameters<RangeExecute>) => unknown
const rangeEq = (a: unknown, b: unknown) => a === b
class Range extends Component {
  @tracked windowType: 'fixed' | 'sliding' = 'fixed'
  @tracked currentValue = 50
  @tracked limitedValue = 50
  handleRangeChange = (utility: RangeUtility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    utility(newValue)
  }
  execute = (value: typeof this.limitedValue) => {
    this.limitedValue = value
  }
  onRejectOption: NonNullable<
    EmberRateLimiterOptions<RangeExecute>['onReject']
  > = (rateLimiter) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  }
  useFixedWindow = () => {
    this.windowType = 'fixed'
  }
  useSlidingWindow = () => {
    this.windowType = 'sliding'
  }
  <template>
    {{#let
      (useRateLimiter
        this.execute
        limit=20
        window=2000
        windowType=this.windowType
        onReject=this.onRejectOption
      )
      as |rateLimitedSetValue|
    }}<div><h1>TanStack Pacer useRateLimiter Example 3</h1><div
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
              {{on
                'input'
                (fn this.handleRangeChange rateLimitedSetValue.maybeExecute)
              }}
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
            /><span>{{this.limitedValue}}</span></label></div><div
          style='color: #666; font-size: 0.9em'
        ><p>Rate limited to 20 updates per 2 seconds</p></div></div>{{/let}}
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
