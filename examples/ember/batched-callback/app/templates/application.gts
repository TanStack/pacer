import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatcher } from '@tanstack/ember-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
type CounterExecute = Counter['execute']
type CounterUtility = (item: Parameters<CounterExecute>[0][number]) => unknown
const counterEq = (a: unknown, b: unknown) => a === b
const counterTime = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
const counterSpace = ' '
class Counter extends Component {
  @tracked logs: LogEntry[] = []
  @tracked logCount = 0
  addLog = (utility: CounterUtility, message: string) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
    }
    this.logCount = this.logCount + 1
    utility(newLog)
  }
  execute = (entries: LogEntry[]) => {
    console.log('Processing batch of logs:', entries)
    this.logs = [...this.logs, ...entries]
  }
  addLogEntry = (utility: CounterUtility) => {
    this.addLog(utility, `Log entry ${this.logCount + 1}`)
  }
  addWarning = (utility: CounterUtility) => {
    this.addLog(utility, `Warning ${this.logCount + 1}`)
  }
  addError = (utility: CounterUtility) => {
    this.addLog(utility, `Error ${this.logCount + 1}`)
  }
  <template>
    {{#let
      (useBatcher this.execute maxSize=3 wait=2000)
      as |batchedLogger|
    }}<div><h1>TanStack Pacer useBatcher Example 1</h1><div
          style='margin-bottom: 20px'
        ><button {{on 'click' (fn this.addLogEntry batchedLogger.addItem)}}>
            Add Log Entry</button><button
            {{on 'click' (fn this.addWarning batchedLogger.addItem)}}
            style='margin-left: 10px'
          > Add Warning</button><button
            {{on 'click' (fn this.addError batchedLogger.addItem)}}
            style='margin-left: 10px'
          > Add Error </button></div><table><tbody><tr><td>Total Logs Created:</td><td
              >{{this.logCount}}</td></tr><tr><td>Logs Processed:</td><td
              >{{this.logs.length}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Processed Logs:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (counterEq this.logs.length 0)}}<p style='color: #666'>No logs
                processed yet...</p>{{else}}{{#each
                this.logs
                as |log index|
              }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong
                  >{{counterTime
                      log.timestamp
                    }}</strong>:{{counterSpace}}{{log.message}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Logs are batched - max 3 items or 2 second wait time
        </p></div>{{/let}}
  </template>
}

interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
type SearchExecute = Search['execute']
type SearchUtility = (item: Parameters<SearchExecute>[0][number]) => unknown
const searchEq = (a: unknown, b: unknown) => a === b
const searchTime = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
const searchSpace = ' '
class Search extends Component {
  @tracked eventHistory: AnalyticsEvent[] = []
  @tracked totalEvents = 0
  @tracked batchesProcessed = 0
  trackEvent = (utility: SearchUtility, type: string, target: string) => {
    const event: AnalyticsEvent = {
      type,
      target,
      timestamp: new Date(),
    }
    this.totalEvents = this.totalEvents + 1
    utility(event)
  }
  execute = (events: AnalyticsEvent[]) => {
    console.log('Sending analytics batch:', events)
    this.eventHistory = [...this.eventHistory, ...events]
    this.batchesProcessed = this.batchesProcessed + 1
  }
  trackButtonClick = (utility: SearchUtility) => {
    this.trackEvent(utility, 'click', 'button-1')
  }
  trackHover = (utility: SearchUtility) => {
    this.trackEvent(utility, 'hover', 'card')
  }
  trackPageView = (utility: SearchUtility) => {
    this.trackEvent(utility, 'view', 'page')
  }
  trackFormSubmit = (utility: SearchUtility) => {
    this.trackEvent(utility, 'form', 'submit')
  }
  <template>
    {{#let (useBatcher this.execute maxSize=5 wait=3000) as |trackEvents|}}<div
      ><h1>TanStack Pacer useBatcher Example 2</h1><div
          style='margin-bottom: 20px'
        ><button {{on 'click' (fn this.trackButtonClick trackEvents.addItem)}}>
            Track Button Click</button><button
            {{on 'click' (fn this.trackHover trackEvents.addItem)}}
            style='margin-left: 10px'
          > Track Hover Event</button><button
            {{on 'click' (fn this.trackPageView trackEvents.addItem)}}
            style='margin-left: 10px'
          > Track Page View</button><button
            {{on 'click' (fn this.trackFormSubmit trackEvents.addItem)}}
            style='margin-left: 10px'
          > Track Form Submit </button></div><table><tbody><tr><td>Total Events
                Created:</td><td>{{this.totalEvents}}</td></tr><tr><td>Events
                Sent:</td><td>{{this.eventHistory.length}}</td></tr><tr><td
              >Batches Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Sent Analytics Events:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (searchEq this.eventHistory.length 0)}}<p
                style='color: #666'
              >No events sent yet...</p>{{else}}{{#each
                this.eventHistory
                as |event index|
              }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong
                  >{{searchTime
                      event.timestamp
                    }}</strong>:{{searchSpace}}{{event.type}}
                  -
                  {{event.target}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Analytics events are batched - max 5 events or 3 second wait time
        </p></div>{{/let}}
  </template>
}

interface ApiRequest {
  id: string
  data: any
}
type RangeExecute = Range['execute']
type RangeUtility = (item: Parameters<RangeExecute>[0][number]) => unknown
const sub = (a: number, b: number) => a - b
const rangeEq = (a: unknown, b: unknown) => a === b
const json = (value: unknown) => JSON.stringify(value, null, 2)
class Range extends Component {
  @tracked requestHistory: ApiRequest[] = []
  @tracked totalRequests = 0
  @tracked processedRequests: ApiRequest[] = []
  makeApiRequest = (utility: RangeUtility, data: any) => {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    this.totalRequests = this.totalRequests + 1
    this.requestHistory = [...this.requestHistory, request]
    utility(request)
  }
  execute = (requests: ApiRequest[]) => {
    console.log('Processing batch of API requests:', requests)
    // Simulate API processing
    this.processedRequests = [...this.processedRequests, ...requests]
  }
  saveDocument = (utility: RangeUtility) => {
    this.makeApiRequest(utility, { action: 'save', item: 'document' })
  }
  updateProfile = (utility: RangeUtility) => {
    this.makeApiRequest(utility, { action: 'update', item: 'profile' })
  }
  deleteFile = (utility: RangeUtility) => {
    this.makeApiRequest(utility, { action: 'delete', item: 'file' })
  }
  createFolder = (utility: RangeUtility) => {
    this.makeApiRequest(utility, { action: 'create', item: 'folder' })
  }
  get pendingRequests() {
    return this.requestHistory.filter(
      (req) => !this.processedRequests.some((p) => p.id === req.id),
    )
  }
  <template>
    {{#let
      (useBatcher this.execute maxSize=4 wait=1500)
      as |batchApiRequests|
    }}<div><h1>TanStack Pacer useBatcher Example 3</h1><div
          style='margin-bottom: 20px'
        ><button {{on 'click' (fn this.saveDocument batchApiRequests.addItem)}}>
            Save Document</button><button
            {{on 'click' (fn this.updateProfile batchApiRequests.addItem)}}
            style='margin-left: 10px'
          > Update Profile</button><button
            {{on 'click' (fn this.deleteFile batchApiRequests.addItem)}}
            style='margin-left: 10px'
          > Delete File</button><button
            {{on 'click' (fn this.createFolder batchApiRequests.addItem)}}
            style='margin-left: 10px'
          > Create Folder </button></div><table><tbody><tr><td>Total Requests
                Made:</td><td>{{this.totalRequests}}</td></tr><tr><td>Requests
                Queued:</td><td>{{sub
                  this.requestHistory.length
                  this.processedRequests.length
                }}</td></tr><tr><td>Requests Processed:</td><td
              >{{this.processedRequests.length}}</td></tr></tbody></table><div
          style='margin-top: 20px; display: flex; gap: 20px'
        ><div style='flex: 1'><h3>Queued Requests:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (rangeEq this.pendingRequests.length 0)}}<p
                  style='color: #666'
                >No requests queued...</p>{{else}}{{#each
                  this.pendingRequests
                  as |request index|
                }}<div
                    style='margin-bottom: 5px; font-size: 0.9em'
                  >{{request.id}}:
                    {{json request.data}}</div>{{/each}}{{/if}}</div></div><div
            style='flex: 1'
          ><h3>Processed Requests:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (rangeEq this.processedRequests.length 0)}}<p
                  style='color: #666'
                >
                  No requests processed yet...
                </p>{{else}}{{#each
                  this.processedRequests
                  as |request index|
                }}<div
                    style='margin-bottom: 5px; font-size: 0.9em'
                  >{{request.id}}:
                    {{json
                      request.data
                    }}</div>{{/each}}{{/if}}</div></div></div><p
          style='font-size: 0.9em; color: #666'
        >
          API requests are batched - max 4 requests or 1.5 second wait time
        </p></div>{{/let}}
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
