import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatcher } from '@tanstack/ember-pacer'
interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
type Execute = Counter['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const eq = (a: unknown, b: unknown) => a === b
const time = (value: number | Date) =>
  (typeof value === 'number' ? new Date(value) : value).toLocaleTimeString()
const space = ' '
export default class Counter extends Component {
  @tracked logs: LogEntry[] = []
  @tracked logCount = 0
  addLog = (utility: Utility, message: string) => {
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
  addLogEntry = (utility: Utility) => {
    this.addLog(utility, `Log entry ${this.logCount + 1}`)
  }
  addWarning = (utility: Utility) => {
    this.addLog(utility, `Warning ${this.logCount + 1}`)
  }
  addError = (utility: Utility) => {
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
          >{{#if (eq this.logs.length 0)}}<p style='color: #666'>No logs
                processed yet...</p>{{else}}{{#each
                this.logs
                as |log index|
              }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong>{{time
                      log.timestamp
                    }}</strong>:{{space}}{{log.message}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Logs are batched - max 3 items or 2 second wait time
        </p></div>{{/let}}
  </template>
}
