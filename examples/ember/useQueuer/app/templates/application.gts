import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useQueuer } from '@tanstack/ember-pacer'
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

type CounterUtility = EmberQueuer<number, QueuerState<number>>
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
  select = (state: QueuerState<number>) => state
  initialItemsOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  addNumber = (utility: CounterUtility) => {
    const nextNumber = utility.state.items.length
      ? utility.state.items[utility.state.items.length - 1]! + 1
      : 1
    utility.addItem(nextNumber)
  }
  processNext = (utility: CounterUtility) => {
    const item = utility.execute()
    console.log('getNextItem item', item)
  }
  clear = (utility: CounterUtility) => {
    utility.clear()
  }
  reset = (utility: CounterUtility) => {
    utility.reset()
  }
  start = (utility: CounterUtility) => {
    utility.start()
  }
  stop = (utility: CounterUtility) => {
    utility.stop()
  }
  flush = (utility: CounterUtility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useQueuer
        this.processItem
        this.select
        key='Add Number Queue'
        initialItems=this.initialItemsOption
        maxSize=25
        started=false
        wait=1000
      )
      as |queuer|
    }}<div><h1>TanStack Pacer useQueuer Example 1</h1><div>Queue Size:
          {{queuer.state.size}}</div><div>Queue Max Size: {{25}}</div><div>Queue
          Full:
          {{if queuer.state.isFull 'Yes' 'No'}}</div><div>Queue Peek:
          {{peek queuer}}</div><div>Queue Empty:
          {{if queuer.state.isEmpty 'Yes' 'No'}}</div><div>Queue Idle:
          {{if queuer.state.isIdle 'Yes' 'No'}}</div><div>Queuer Status:
          {{queuer.state.status}}</div><div>Items Processed:
          {{queuer.state.executionCount}}</div><div>Queue Items:
          {{join queuer.state.items ', '}}</div><div
          style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 600px; margin: 16px 0'
        ><button
            {{on 'click' (fn this.addNumber queuer)}}
            disabled={{queuer.state.isFull}}
          > Add Number</button><button
            disabled={{queuer.state.isEmpty}}
            {{on 'click' (fn this.processNext queuer)}}
          > Process Next</button><button
            {{on 'click' (fn this.clear queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Clear Queue</button><button
            {{on 'click' (fn this.reset queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Reset Queue</button><button
            {{on 'click' (fn this.start queuer)}}
            disabled={{queuer.state.isRunning}}
          > Start Processing</button><button
            {{on 'click' (fn this.stop queuer)}}
            disabled={{not queuer.state.isRunning}}
          > Stop Processing</button><button
            {{on 'click' (fn this.flush queuer)}}
            disabled={{queuer.state.isEmpty}}
          > Flush Queue </button></div><pre
          style='margin-top: 20px'
        >{{counterJson queuer.state}}</pre></div>{{/let}}
  </template>
}

type RangeUtility = EmberQueuer<number, QueuerState<number>>
const rangeJson = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked currentValue = 50
  @tracked queuedValue = 50
  @tracked submittedCount = 1
  processItem = (item: number) => {
    this.queuedValue = item
  }
  handleRangeChange = (utility: RangeUtility, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.submittedCount = this.submittedCount + 1
    utility.addItem(newValue)
  }
  select = (state: QueuerState<number>) => state
  initialItemsOption = [this.currentValue]
  flush = (utility: RangeUtility) => {
    utility.flush()
  }
  <template>
    {{#let
      (useQueuer
        this.processItem
        this.select
        key='Range Queue'
        maxSize=100
        initialItems=this.initialItemsOption
        wait=100
      )
      as |queuer|
    }}<div><h1>TanStack Pacer useQueuer Example 2</h1><div
          style='margin-bottom: 20px'
        ><label>Current Range:<input
              type='range'
              min='0'
              max='100'
              value={{this.currentValue}}
              {{on 'input' (fn this.handleRangeChange queuer)}}
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
                }}</td></tr><tr><td>Queuer Status:</td><td>{{if
                  queuer.state.isRunning
                  'Running'
                  'Stopped'
                }}</td></tr><tr><td>Values Submitted:</td><td
              >{{this.submittedCount}}</td></tr><tr><td>Items Processed:</td><td
              >{{queuer.state.executionCount}}</td></tr><tr><td>Pending Items:</td><td
              >{{queuer.state.size}}</td></tr></tbody></table><div
          style='color: #666; font-size: 0.9em'
        ><p>Queued with 100ms wait time</p></div><div><button
            {{on 'click' (fn this.flush queuer)}}
          >Flush Queue</button></div><pre style='margin-top: 20px'>{{rangeJson
            queuer.state
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
    <div><Counter /><hr /><Range /></div>
  </template>
}
