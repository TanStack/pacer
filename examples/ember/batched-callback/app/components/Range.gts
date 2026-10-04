import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useBatcher } from '@tanstack/ember-pacer'
interface ApiRequest {
  id: string
  data: any
}
type Execute = Range['execute']
type Utility = (item: Parameters<Execute>[0][number]) => unknown
const sub = (a: number, b: number) => a - b
const eq = (a: unknown, b: unknown) => a === b
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Range extends Component {
  @tracked requestHistory: ApiRequest[] = []
  @tracked totalRequests = 0
  @tracked processedRequests: ApiRequest[] = []
  makeApiRequest = (utility: Utility, data: any) => {
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
  saveDocument = (utility: Utility) => {
    this.makeApiRequest(utility, { action: 'save', item: 'document' })
  }
  updateProfile = (utility: Utility) => {
    this.makeApiRequest(utility, { action: 'update', item: 'profile' })
  }
  deleteFile = (utility: Utility) => {
    this.makeApiRequest(utility, { action: 'delete', item: 'file' })
  }
  createFolder = (utility: Utility) => {
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
            >{{#if (eq this.pendingRequests.length 0)}}<p style='color: #666'>No
                  requests queued...</p>{{else}}{{#each
                  this.pendingRequests
                  as |request index|
                }}<div
                    style='margin-bottom: 5px; font-size: 0.9em'
                  >{{request.id}}:
                    {{json request.data}}</div>{{/each}}{{/if}}</div></div><div
            style='flex: 1'
          ><h3>Processed Requests:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (eq this.processedRequests.length 0)}}<p style='color: #666'>
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
