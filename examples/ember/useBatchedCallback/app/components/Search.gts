import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatchedCallback } from '@tanstack/ember-pacer'
interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
type Execute = Search['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const eq = (a: unknown, b: unknown) => a === b
const time = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
const space = ' '
export default class Search extends Component {
  @tracked eventHistory: AnalyticsEvent[] = []
  @tracked totalEvents = 0
  @tracked batchesProcessed = 0
  trackEvent = (utility: Utility, type: string, target: string) => {
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
  trackButtonClick = (utility: Utility) => {
    this.trackEvent(utility, 'click', 'button-1')
  }
  trackHover = (utility: Utility) => {
    this.trackEvent(utility, 'hover', 'card')
  }
  trackPageView = (utility: Utility) => {
    this.trackEvent(utility, 'view', 'page')
  }
  trackFormSubmit = (utility: Utility) => {
    this.trackEvent(utility, 'form', 'submit')
  }
  <template>
    {{#let
      (useBatchedCallback this.execute maxSize=5 wait=3000)
      as |trackEvents|
    }}<div><h1>TanStack Pacer useBatchedCallback Example 2</h1><div
          style='margin-bottom: 20px'
        ><button {{on 'click' (fn this.trackButtonClick trackEvents)}}>
            Track Button Click</button><button
            {{on 'click' (fn this.trackHover trackEvents)}}
            style='margin-left: 10px'
          > Track Hover Event</button><button
            {{on 'click' (fn this.trackPageView trackEvents)}}
            style='margin-left: 10px'
          > Track Page View</button><button
            {{on 'click' (fn this.trackFormSubmit trackEvents)}}
            style='margin-left: 10px'
          > Track Form Submit </button></div><table><tbody><tr><td>Total Events
                Created:</td><td>{{this.totalEvents}}</td></tr><tr><td>Events
                Sent:</td><td>{{this.eventHistory.length}}</td></tr><tr><td
              >Batches Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Sent Analytics Events:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (eq this.eventHistory.length 0)}}<p style='color: #666'>No
                events sent yet...</p>{{else}}{{#each
                this.eventHistory
                as |event index|
              }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong>{{time
                      event.timestamp
                    }}</strong>:{{space}}{{event.type}}
                  -
                  {{event.target}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Analytics events are batched - max 5 events or 3 second wait time
        </p></div>{{/let}}
  </template>
}
