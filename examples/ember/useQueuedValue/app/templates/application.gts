import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedValue } from '@tanstack/ember-pacer'
import type {
  EmberQueuer,
  QueuerState,
  EmberQueuedValue,
} from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterValue = Counter['instantSearchValue']

type CounterSelected = QueuerState<CounterValue>
type Utility = EmberQueuer<CounterValue, CounterSelected>
type Result = EmberQueuedValue<CounterValue, CounterSelected>
const peek = (utility: Utility) => {
  void utility.state
  return utility.peekNextItem()
}
const peekAll = (utility: Utility) => {
  void utility.state
  return utility.peekAllItems()
}
const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
const not = (value: unknown) => !value
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  @tracked instantSearchValue = ''
  select = (state: CounterSelected) => state
  updateSearch = (result: Result, e: Event) => {
    this.instantSearchValue = (e.target as HTMLInputElement).value // instantly update the local search result.value
  }
  processNext = (result: Result) => {
    result.utility.execute()
  }
  clear = (result: Result) => {
    result.utility.clear()
  }
  reset = (result: Result) => {
    result.utility.reset()
  }
  start = (result: Result) => {
    result.utility.start()
  }
  stop = (result: Result) => {
    result.utility.stop()
  }
  <template>
    {{#let
      (useQueuedValue this.instantSearchValue this.select maxSize=25 wait=500)
      as |result|
    }}{{#let result.value result.utility as |value queuer|}}<div><h1>TanStack
            Pacer useQueuedValue Example 1</h1><div>Current Value:
            {{value}}</div><hr /><div>Queue Size:
            {{queuer.state.size}}</div><div>Queue Full:
            {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue Peek:
            {{peek queuer}}</div><div>Queue Empty:
            {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
            {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
            {{queuer.state.status}}</div><div>Items Processed:
            {{queuer.state.executionCount}}</div><div>Queue Items:
            {{join (peekAll queuer) ', '}}</div><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
          ><input
              type='search'
              value={{this.instantSearchValue}}
              {{on 'input' (fn this.updateSearch result)}}
              placeholder='Enter search term...'
              disabled={{queuer.state.isFull}}
            /><button
              disabled={{queuer.state.isEmpty}}
              {{on 'click' (fn this.processNext result)}}
            > Process Next</button><button
              {{on 'click' (fn this.clear result)}}
              disabled={{queuer.state.isEmpty}}
            > Clear Queue</button><button
              {{on 'click' (fn this.reset result)}}
              disabled={{queuer.state.isEmpty}}
            > Reset Queue</button><button
              {{on 'click' (fn this.start result)}}
              disabled={{queuer.state.isRunning}}
            > Start Processing</button><button
              {{on 'click' (fn this.stop result)}}
              disabled={{not queuer.state.isRunning}}
            > Stop Processing </button></div><pre
            style='margin-top: 20px'
          >{{counterJson queuer.state}}</pre></div>{{/let}}{{/let}}
  </template>
}

type SearchValue = Search['currentValue']

type SearchSelected = QueuerState<SearchValue>

const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  @tracked currentValue = 50
  @tracked submittedCount = 1
  handleRangeChange = (e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
  }
  select = (state: SearchSelected) => state
  <template>
    {{#let
      (useQueuedValue this.currentValue this.select maxSize=100 wait=100)
      as |result|
    }}{{#let result.value result.utility as |queuedValue queuer|}}<div><h1
          >TanStack Pacer useQueuedValue Example 2</h1><div
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
          ><label>Queued Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{queuedValue}}
                disabled
                style='width: 100%'
              /><span>{{queuedValue}}</span></label></div><table><tbody><tr><td
                >Queue Size:</td><td>{{queuer.state.size}}</td></tr><tr><td
                >Queue Full:</td><td>{{if
                    queuer.state.isFull
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queue Empty:</td><td>{{if
                    queuer.state.isEmpty
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queue Idle:</td><td>{{if
                    queuer.state.isIdle
                    'Yes'
                    'No'
                  }}</td></tr><tr><td>Queuer Status:</td><td
                >{{queuer.state.status}}</td></tr><tr><td>Values Submitted:</td><td
                >{{this.submittedCount}}</td></tr><tr><td>Items Processed:</td><td
                >{{queuer.state.executionCount}}</td></tr><tr><td>Pending Items:</td><td
                >{{queuer.state.size}}</td></tr></tbody></table><div
            style='color: #666; font-size: 0.9em'
          ><p>Queued with 100ms wait time</p></div><pre
            style='margin-top: 20px'
          >{{searchJson queuer.state}}</pre></div>{{/let}}{{/let}}
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
    <div><Counter /><hr /><Search /></div>
  </template>
}
