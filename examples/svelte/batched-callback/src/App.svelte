<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createBatcher } from '@tanstack/svelte-pacer/batcher'

  interface LogEntry {
    id: number
    message: string
    timestamp: Date
  }
  let logs = $state<LogEntry[]>([])

  let logCount = $state(0)

  const batchedLogger = createBatcher(
    (entries: LogEntry[]) => {
      console.log('Processing batch of logs:', entries)
      logs = [...logs, ...entries]
    },
    () => ({
      maxSize: 3, // Process when 3 logs collected
      wait: 2000, // Or after 2 seconds
    }),
  ).addItem

  function addLog(message: string) {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
    }
    logCount = logCount + 1
    batchedLogger(newLog)
  }

  interface ApiRequest {
    id: string
    data: any
  }
  let requestHistory = $state<ApiRequest[]>([])

  let totalRequests = $state(0)

  let processedRequests = $state<ApiRequest[]>([])

  const batchApiRequests = createBatcher(
    (requests: ApiRequest[]) => {
      console.log('Processing batch of API requests:', requests)
      // Simulate API processing
      processedRequests = [...processedRequests, ...requests]
    },
    () => ({
      maxSize: 4, // Process when 4 requests collected
      wait: 1500, // Or after 1.5 seconds
    }),
  ).addItem

  function makeApiRequest(data: any) {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    totalRequests = totalRequests + 1
    requestHistory = [...requestHistory, request]
    batchApiRequests(request)
  }

  interface AnalyticsEvent {
    type: string
    target: string
    timestamp: Date
  }
  let eventHistory = $state<AnalyticsEvent[]>([])

  let totalEvents = $state(0)

  let batchesProcessed = $state(0)

  const trackEvents = createBatcher(
    (events: AnalyticsEvent[]) => {
      console.log('Sending analytics batch:', events)
      eventHistory = [...eventHistory, ...events]
      batchesProcessed = batchesProcessed + 1
    },
    () => ({
      maxSize: 5, // Send when 5 events collected
      wait: 3000, // Or after 3 seconds
    }),
  ).addItem

  function trackEvent(type: string, target: string) {
    const event: AnalyticsEvent = {
      type,
      target,
      timestamp: new Date(),
    }
    totalEvents = totalEvents + 1
    trackEvents(event)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createBatcher Example 1</h1>
    <div style="margin-bottom: 20px">
      <button onclick={() => addLog(`Log entry ${logCount + 1}`)}>
        Add Log Entry</button
      ><button
        onclick={() => addLog(`Warning ${logCount + 1}`)}
        style="margin-left: 10px"
      >
        Add Warning</button
      ><button
        onclick={() => addLog(`Error ${logCount + 1}`)}
        style="margin-left: 10px"
      >
        Add Error
      </button>
    </div>
    <table>
      <tbody
        ><tr><td>Total Logs Created:</td><td>{logCount}</td></tr><tr
          ><td>Logs Processed:</td><td>{logs.length}</td></tr
        ></tbody
      >
    </table>
    <div style="margin-top: 20px">
      <h3>Processed Logs:</h3>
      <div
        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if logs.length === 0}<p style="color: #666">
            No logs processed yet...
          </p>{:else}{#each logs as log, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              <strong>{log.timestamp.toLocaleTimeString()}</strong
              >:{' '}{log.message}
            </div>{/each}{/if}
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Logs are batched - max 3 items or 2 second wait time
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createBatcher Example 2</h1>
    <div style="margin-bottom: 20px">
      <button onclick={() => trackEvent('click', 'button-1')}>
        Track Button Click</button
      ><button
        onclick={() => trackEvent('hover', 'card')}
        style="margin-left: 10px"
      >
        Track Hover Event</button
      ><button
        onclick={() => trackEvent('view', 'page')}
        style="margin-left: 10px"
      >
        Track Page View</button
      ><button
        onclick={() => trackEvent('form', 'submit')}
        style="margin-left: 10px"
      >
        Track Form Submit
      </button>
    </div>
    <table>
      <tbody
        ><tr><td>Total Events Created:</td><td>{totalEvents}</td></tr><tr
          ><td>Events Sent:</td><td>{eventHistory.length}</td></tr
        ><tr><td>Batches Processed:</td><td>{batchesProcessed}</td></tr></tbody
      >
    </table>
    <div style="margin-top: 20px">
      <h3>Sent Analytics Events:</h3>
      <div
        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if eventHistory.length === 0}<p style="color: #666">
            No events sent yet...
          </p>{:else}{#each eventHistory as event, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              <strong>{event.timestamp.toLocaleTimeString()}</strong
              >:{' '}{event.type} - {event.target}
            </div>{/each}{/if}
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Analytics events are batched - max 5 events or 3 second wait time
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createBatcher Example 3</h1>
    <div style="margin-bottom: 20px">
      <button
        onclick={() => makeApiRequest({ action: 'save', item: 'document' })}
      >
        Save Document</button
      ><button
        onclick={() => makeApiRequest({ action: 'update', item: 'profile' })}
        style="margin-left: 10px"
      >
        Update Profile</button
      ><button
        onclick={() => makeApiRequest({ action: 'delete', item: 'file' })}
        style="margin-left: 10px"
      >
        Delete File</button
      ><button
        onclick={() => makeApiRequest({ action: 'create', item: 'folder' })}
        style="margin-left: 10px"
      >
        Create Folder
      </button>
    </div>
    <table>
      <tbody
        ><tr><td>Total Requests Made:</td><td>{totalRequests}</td></tr><tr
          ><td>Requests Queued:</td><td
            >{requestHistory.length - processedRequests.length}</td
          ></tr
        ><tr><td>Requests Processed:</td><td>{processedRequests.length}</td></tr
        ></tbody
      >
    </table>
    <div style="margin-top: 20px; display: flex; gap: 20px">
      <div style="flex: 1">
        <h3>Queued Requests:</h3>
        <div
          style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
        >
          {#if requestHistory.filter((req) => !processedRequests.some((p) => p.id === req.id)).length === 0}<p
              style="color: #666"
            >
              No requests queued...
            </p>{:else}{#each requestHistory.filter((req) => !processedRequests.some((p) => p.id === req.id)) as request, index (index)}<div
                style="margin-bottom: 5px; font-size: 0.9em"
              >
                {request.id}: {JSON.stringify(request.data)}
              </div>{/each}{/if}
        </div>
      </div>
      <div style="flex: 1">
        <h3>Processed Requests:</h3>
        <div
          style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
        >
          {#if processedRequests.length === 0}<p style="color: #666">
              No requests processed yet...
            </p>{:else}{#each processedRequests as request, index (index)}<div
                style="margin-bottom: 5px; font-size: 0.9em"
              >
                {request.id}: {JSON.stringify(request.data)}
              </div>{/each}{/if}
        </div>
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      API requests are batched - max 4 requests or 1.5 second wait time
    </p>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
