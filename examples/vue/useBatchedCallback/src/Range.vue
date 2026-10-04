<script setup lang="ts">
import { ref } from 'vue'
import { useBatchedCallback } from '@tanstack/vue-pacer/batcher'
interface ApiRequest {
  id: string
  data: any
}
const requestHistory = ref<ApiRequest[]>([])

const totalRequests = ref(0)

const processedRequests = ref<ApiRequest[]>([])

const batchApiRequests = useBatchedCallback(
  (requests: ApiRequest[]) => {
    console.log('Processing batch of API requests:', requests)
    // Simulate API processing
    processedRequests.value = [...processedRequests.value, ...requests]
  },
  () => ({
    maxSize: 4, // Process when 4 requests collected
    wait: 1500, // Or after 1.5 seconds
  }),
)

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
    <h1>TanStack Pacer useBatchedCallback Example 3</h1>
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
</template>
