<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useBatcher } from '@tanstack/vue-pacer/batcher'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
const logs = ref<LogEntry[]>([])

const logCount = ref(0)

const batchedLogger = useBatcher(
  (entries: LogEntry[]) => {
    console.log('Processing batch of logs:', entries)
    logs.value = [...logs.value, ...entries]
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
  logCount.value = logCount.value + 1
  batchedLogger(newLog)
}

interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
const eventHistory = ref<AnalyticsEvent[]>([])

const totalEvents = ref(0)

const batchesProcessed = ref(0)

const trackEvents = useBatcher(
  (events: AnalyticsEvent[]) => {
    console.log('Sending analytics batch:', events)
    eventHistory.value = [...eventHistory.value, ...events]
    batchesProcessed.value = batchesProcessed.value + 1
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
  totalEvents.value = totalEvents.value + 1
  trackEvents(event)
}

interface ApiRequest {
  id: string
  data: any
}
const requestHistory = ref<ApiRequest[]>([])

const totalRequests = ref(0)

const processedRequests = ref<ApiRequest[]>([])

const batchApiRequests = useBatcher(
  (requests: ApiRequest[]) => {
    console.log('Processing batch of API requests:', requests)
    // Simulate API processing
    processedRequests.value = [...processedRequests.value, ...requests]
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
  totalRequests.value = totalRequests.value + 1
  requestHistory.value = [...requestHistory.value, request]
  batchApiRequests(request)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useBatcher Example 1</h1>
      <div :style="{ marginBottom: '20px' }">
        <button @click="() => addLog(`Log entry ${logCount + 1}`)">
          Add Log Entry</button
        ><button
          @click="() => addLog(`Warning ${logCount + 1}`)"
          :style="{ marginLeft: '10px' }"
        >
          Add Warning</button
        ><button
          @click="() => addLog(`Error ${logCount + 1}`)"
          :style="{ marginLeft: '10px' }"
        >
          Add Error
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Logs Created:</td>
            <td>{{ logCount }}</td>
          </tr>
          <tr>
            <td>Logs Processed:</td>
            <td>{{ logs.length }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px' }">
        <h3>Processed Logs:</h3>
        <div
          :style="{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="logs.length === 0"
            ><p :style="{ color: '#666' }">
              No logs processed yet...
            </p></template
          ><template v-else
            ><template v-for="(log, index) in logs" :key="index"
              ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                <strong>{{ log.timestamp.toLocaleTimeString() }}</strong
                >:{{ ' ' }}{{ log.message }}
              </div></template
            ></template
          >
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Logs are batched - max 3 items or 2 second wait time
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useBatcher Example 2</h1>
      <div :style="{ marginBottom: '20px' }">
        <button @click="() => trackEvent('click', 'button-1')">
          Track Button Click</button
        ><button
          @click="() => trackEvent('hover', 'card')"
          :style="{ marginLeft: '10px' }"
        >
          Track Hover Event</button
        ><button
          @click="() => trackEvent('view', 'page')"
          :style="{ marginLeft: '10px' }"
        >
          Track Page View</button
        ><button
          @click="() => trackEvent('form', 'submit')"
          :style="{ marginLeft: '10px' }"
        >
          Track Form Submit
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Events Created:</td>
            <td>{{ totalEvents }}</td>
          </tr>
          <tr>
            <td>Events Sent:</td>
            <td>{{ eventHistory.length }}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{{ batchesProcessed }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px' }">
        <h3>Sent Analytics Events:</h3>
        <div
          :style="{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="eventHistory.length === 0"
            ><p :style="{ color: '#666' }">No events sent yet...</p></template
          ><template v-else
            ><template v-for="(event, index) in eventHistory" :key="index"
              ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                <strong>{{ event.timestamp.toLocaleTimeString() }}</strong
                >:{{ ' ' }}{{ event.type }} - {{ event.target }}
              </div></template
            ></template
          >
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Analytics events are batched - max 5 events or 3 second wait time
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useBatcher Example 3</h1>
      <div :style="{ marginBottom: '20px' }">
        <button
          @click="() => makeApiRequest({ action: 'save', item: 'document' })"
        >
          Save Document</button
        ><button
          @click="() => makeApiRequest({ action: 'update', item: 'profile' })"
          :style="{ marginLeft: '10px' }"
        >
          Update Profile</button
        ><button
          @click="() => makeApiRequest({ action: 'delete', item: 'file' })"
          :style="{ marginLeft: '10px' }"
        >
          Delete File</button
        ><button
          @click="() => makeApiRequest({ action: 'create', item: 'folder' })"
          :style="{ marginLeft: '10px' }"
        >
          Create Folder
        </button>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Total Requests Made:</td>
            <td>{{ totalRequests }}</td>
          </tr>
          <tr>
            <td>Requests Queued:</td>
            <td>{{ requestHistory.length - processedRequests.length }}</td>
          </tr>
          <tr>
            <td>Requests Processed:</td>
            <td>{{ processedRequests.length }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px', display: 'flex', gap: '20px' }">
        <div :style="{ flex: 1 }">
          <h3>Queued Requests:</h3>
          <div
            :style="{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }"
          >
            <template
              v-if="
                requestHistory.filter(
                  (req) => !processedRequests.some((p) => p.id === req.id),
                ).length === 0
              "
              ><p :style="{ color: '#666' }">No requests queued...</p></template
            ><template v-else
              ><template
                v-for="(request, index) in requestHistory.filter(
                  (req) => !processedRequests.some((p) => p.id === req.id),
                )"
                :key="index"
                ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                  {{ request.id }}: {{ JSON.stringify(request.data) }}
                </div></template
              ></template
            >
          </div>
        </div>
        <div :style="{ flex: 1 }">
          <h3>Processed Requests:</h3>
          <div
            :style="{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }"
          >
            <template v-if="processedRequests.length === 0"
              ><p :style="{ color: '#666' }">
                No requests processed yet...
              </p></template
            ><template v-else
              ><template
                v-for="(request, index) in processedRequests"
                :key="index"
                ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                  {{ request.id }}: {{ JSON.stringify(request.data) }}
                </div></template
              ></template
            >
          </div>
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        API requests are batched - max 4 requests or 1.5 second wait time
      </p>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
