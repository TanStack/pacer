import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuedState } from '@tanstack/ember-pacer'
import type { EmberQueuer, QueuerState } from '@tanstack/ember-pacer'
import { tracked } from '@glimmer/tracking'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

type CounterValue = Parameters<Counter['processItem']>[0]

type CounterSelected = QueuerState<CounterValue>
type CounterUtility = EmberQueuer<CounterValue, CounterSelected>
type CounterResult = CounterUtility
const peek = (utility: CounterUtility) => {
  void utility.state
  return utility.peekNextItem()
}
const join = (values: ReadonlyArray<unknown>, separator: string) =>
  values.join(separator)
const not = (value: unknown) => !value
const counterJson = (value: unknown) => JSON.stringify(value, null, 2)
class Counter extends Component {
  processItem = (item: number) => {
    console.log('processing item', item)
  }
  select = (state: CounterSelected) => state
  initialItemsOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  addNumber = (result: CounterResult) => {
    const nextNumber = result.state.items.length
      ? result.state.items[result.state.items.length - 1]! + 1
      : 1
    result.addItem(nextNumber)
  }
  execute = (result: CounterResult) => {
    result.execute()
  }
  clear = (result: CounterResult) => {
    result.clear()
  }
  reset = (result: CounterResult) => {
    result.reset()
  }
  start = (result: CounterResult) => {
    result.start()
  }
  stop = (result: CounterResult) => {
    result.stop()
  }
  <template>
    {{#let
      (useQueuedState
        this.processItem
        this.select
        maxSize=25
        initialItems=this.initialItemsOption
        started=false
        wait=1000
      )
      as |result|
    }}{{#let
        result.state.items result.addItem result
        as |queueItems addItem queuer|
      }}<div><h1>TanStack Pacer useQueuedState Example 1</h1><div>Queue Size:
            {{queuer.state.size}}</div><div>Queue Max Size: {{25}}</div><div
          >Queue Full: {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue
            Peek:
            {{peek queuer}}</div><div>Queue Empty:
            {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
            {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
            {{queuer.state.status}}</div><div>Items Processed:
            {{queuer.state.executionCount}}</div><div>Queue Items:
            {{join queueItems ', '}}</div><div
            style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
          ><button
              {{on 'click' (fn this.addNumber result)}}
              disabled={{queuer.state.isFull}}
            > Add Number</button><button
              disabled={{queuer.state.isEmpty}}
              {{on 'click' (fn this.execute result)}}
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

type SearchValue = number

type SearchSelected = QueuerState<SearchValue>
type SearchUtility = EmberQueuer<SearchValue, SearchSelected>
type SearchResult = SearchUtility
const searchJson = (value: unknown) => JSON.stringify(value, null, 2)
class Search extends Component {
  @tracked currentValue = 50
  @tracked queuedValue = 50
  @tracked submittedCount = 0
  handleRangeChange = (result: SearchResult, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    result.addItem(newValue)
  }
  processItem = (item: number) => {
    this.queuedValue = item
  }
  select = (state: SearchSelected) => state
  <template>
    {{#let
      (useQueuedState
        this.processItem this.select maxSize=100 started=true wait=100
      )
      as |result|
    }}{{#let result.addItem result as |addItem queuer|}}<div><h1>TanStack Pacer
            useQueuedState Example 2</h1><div style='margin-bottom: 20px'><label
            >Current Range:<input
                type='range'
                min='0'
                max='100'
                value={{this.currentValue}}
                {{on 'input' (fn this.handleRangeChange result)}}
                style='width: 100%'
              /><span>{{this.currentValue}}</span></label></div><div
            style='margin-bottom: 20px'
          ><label>Queued Range (Readonly):<input
                type='range'
                min='0'
                max='100'
                value={{this.queuedValue}}
                disabled
                style='width: 100%'
              /><span>{{this.queuedValue}}</span></label></div><table><tbody><tr
              ><td>Queue Size:</td><td>{{queuer.state.size}}</td></tr><tr><td
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
