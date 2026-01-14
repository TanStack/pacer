<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncQueuer } from '@tanstack/vue-pacer/async-queuer'

interface ApiRequest {
  id: number
  endpoint: string
}

interface ApiResponse {
  id: number
  endpoint: string
  result: string
}

const completedRequests = ref<Array<ApiResponse>>([])
const requestCounter = ref(0)
const concurrency = ref(2)

// Simulate an API request
async function simulateApiRequest(request: ApiRequest): Promise<void> {
  const delay = 500 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))
  completedRequests.value = [
    ...completedRequests.value,
    {
      id: request.id,
      endpoint: request.endpoint,
      result: `Response from ${request.endpoint}`,
    },
  ]
}

const asyncQueuer = useAsyncQueuer<ApiRequest>(simulateApiRequest, {
  concurrency: concurrency.value,
  maxSize: 10,
  started: true,
  onReject: (item) => {
    console.log('Queue full, rejecting request:', item.endpoint)
  },
  onError: (error, item) => {
    console.error(`Error processing ${item.endpoint}:`, error)
  },
})

function addRequest(endpoint: string) {
  requestCounter.value++
  asyncQueuer.addItem({
    id: requestCounter.value,
    endpoint,
  })
}

function addBatchRequests() {
  const endpoints = ['/api/users', '/api/posts', '/api/comments']
  endpoints.forEach((endpoint) => addRequest(endpoint))
}

function clearCompleted() {
  completedRequests.value = []
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncQueuer Example</h1>

    <div style="margin-bottom: 20px">
      <button @click="addRequest('/api/users')">Add User Request</button>
      <button @click="addRequest('/api/posts')" style="margin-left: 10px">
        Add Post Request
      </button>
      <button @click="addBatchRequests" style="margin-left: 10px">
        Add 3 Requests
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <asyncQueuer.Subscribe
        :selector="(state) => state.isRunning"
        v-slot="isRunning"
      >
        <button @click="asyncQueuer.start()" :disabled="isRunning">
          Start
        </button>
        <button
          @click="asyncQueuer.stop()"
          :disabled="!isRunning"
          style="margin-left: 10px"
        >
          Stop
        </button>
      </asyncQueuer.Subscribe>
      <button @click="asyncQueuer.clear()" style="margin-left: 10px">
        Clear Queue
      </button>
      <button @click="clearCompleted" style="margin-left: 10px">
        Clear Completed
      </button>
      <button @click="asyncQueuer.reset()" style="margin-left: 10px">
        Reset
      </button>
    </div>

    <table>
      <tbody>
        <asyncQueuer.Subscribe
          :selector="
            (state) => ({
              size: state.size,
              isEmpty: state.isEmpty,
              isFull: state.isFull,
              isIdle: state.isIdle,
              isRunning: state.isRunning,
              status: state.status,
              successCount: state.successCount,
              errorCount: state.errorCount,
              rejectionCount: state.rejectionCount,
              activeItems: state.activeItems,
            })
          "
          v-slot="{
            size,
            isEmpty,
            isFull,
            isIdle,
            isRunning,
            status,
            successCount,
            errorCount,
            rejectionCount,
            activeItems,
          }"
        >
          <tr>
            <td>Status:</td>
            <td>{{ status }}</td>
          </tr>
          <tr>
            <td>Queue Size:</td>
            <td>{{ size }} / 10</td>
          </tr>
          <tr>
            <td>Active Requests:</td>
            <td>{{ activeItems.length }} / {{ concurrency }}</td>
          </tr>
          <tr>
            <td>Is Empty:</td>
            <td>{{ isEmpty }}</td>
          </tr>
          <tr>
            <td>Is Full:</td>
            <td>{{ isFull }}</td>
          </tr>
          <tr>
            <td>Is Idle:</td>
            <td>{{ isIdle }}</td>
          </tr>
          <tr>
            <td>Is Running:</td>
            <td>{{ isRunning }}</td>
          </tr>
          <tr>
            <td>Success Count:</td>
            <td>{{ successCount }}</td>
          </tr>
          <tr>
            <td>Error Count:</td>
            <td>{{ errorCount }}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{{ rejectionCount }}</td>
          </tr>
        </asyncQueuer.Subscribe>
      </tbody>
    </table>

    <div style="margin-top: 20px; display: flex; gap: 40px">
      <div>
        <h3>Active Requests</h3>
        <asyncQueuer.Subscribe
          :selector="(state) => state.activeItems"
          v-slot="activeItems"
        >
          <ul v-if="activeItems.length > 0">
            <li v-for="item in activeItems" :key="item.id">
              #{{ item.id }}: {{ item.endpoint }} (processing...)
            </li>
          </ul>
          <p v-else style="color: #666">No active requests</p>
        </asyncQueuer.Subscribe>
      </div>

      <div>
        <h3>Pending Requests</h3>
        <asyncQueuer.Subscribe
          :selector="(state) => state.items"
          v-slot="items"
        >
          <ul v-if="items.length > 0">
            <li v-for="item in items" :key="item.id">
              #{{ item.id }}: {{ item.endpoint }}
            </li>
          </ul>
          <p v-else style="color: #666">No pending requests</p>
        </asyncQueuer.Subscribe>
      </div>

      <div>
        <h3>Completed Requests</h3>
        <ul v-if="completedRequests.length > 0">
          <li v-for="response in completedRequests" :key="response.id">
            #{{ response.id }}: {{ response.result }}
          </li>
        </ul>
        <p v-else style="color: #666">No completed requests</p>
      </div>
    </div>

    <asyncQueuer.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </asyncQueuer.Subscribe>
  </div>
</template>
