<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncThrottler } from '@tanstack/vue-pacer/async-throttler'

interface ApiResponse {
  id: number
  data: string
  timestamp: number
}

const clickCount = ref(0)
const responses = ref<Array<ApiResponse>>([])
const error = ref<string | null>(null)

// Simulated API fetch function
async function fetchAPI(requestId: number): Promise<ApiResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Simulate occasional errors
  if (requestId % 7 === 0) {
    throw new Error(`Request ${requestId} failed: Server error`)
  }

  return {
    id: requestId,
    data: `Response for request #${requestId}`,
    timestamp: Date.now(),
  }
}

const apiThrottler = useAsyncThrottler(
  async (requestId: number) => {
    error.value = null
    const response = await fetchAPI(requestId)
    responses.value = [response, ...responses.value].slice(0, 10)
    return response
  },
  {
    wait: 1000,
    onError: (err) => {
      error.value = err.message
    },
  },
)

function handleClick() {
  clickCount.value++
  apiThrottler.maybeExecute(clickCount.value)
}

function handleClear() {
  clickCount.value = 0
  responses.value = []
  error.value = null
  apiThrottler.cancel()
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncThrottler Example</h1>
    <p>
      This example demonstrates throttled async API fetching. Rapid clicks are
      throttled to execute at most once per second, preventing API overload.
    </p>

    <div style="margin-bottom: 1rem">
      <button
        @click="handleClick"
        style="padding: 0.5rem 1rem; font-size: 1rem"
      >
        Fetch Data (clicked {{ clickCount }} times)
      </button>
    </div>

    <div style="margin-bottom: 1rem">
      <button @click="apiThrottler.flush()">Flush (Execute Now)</button>
      <button @click="apiThrottler.cancel()" style="margin-left: 0.5rem">
        Cancel Pending
      </button>
      <button @click="apiThrottler.abort()" style="margin-left: 0.5rem">
        Abort In-Flight
      </button>
      <button @click="handleClear" style="margin-left: 0.5rem">Clear</button>
    </div>

    <apiThrottler.Subscribe
      :selector="
        (state) => ({
          status: state.status,
          isPending: state.isPending,
          isExecuting: state.isExecuting,
          successCount: state.successCount,
          errorCount: state.errorCount,
          settleCount: state.settleCount,
          maybeExecuteCount: state.maybeExecuteCount,
        })
      "
      v-slot="{
        status,
        isPending,
        isExecuting,
        successCount,
        errorCount,
        settleCount,
        maybeExecuteCount,
      }"
    >
      <table>
        <tbody>
          <tr>
            <td>Status:</td>
            <td>
              <strong>{{ status }}</strong>
            </td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{{ isPending }}</td>
          </tr>
          <tr>
            <td>Is Executing:</td>
            <td>{{ isExecuting }}</td>
          </tr>
          <tr>
            <td colspan="2">
              <hr />
            </td>
          </tr>
          <tr>
            <td>Maybe Execute Count:</td>
            <td>{{ maybeExecuteCount }}</td>
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
            <td>Settle Count:</td>
            <td>{{ settleCount }}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{{ maybeExecuteCount - settleCount }}</td>
          </tr>
        </tbody>
      </table>
    </apiThrottler.Subscribe>

    <div v-if="error" style="color: red; margin-top: 1rem">
      {{ error }}
    </div>

    <div v-if="responses.length > 0" style="margin-top: 1rem">
      <h3>Recent Responses:</h3>
      <ul>
        <li v-for="response in responses" :key="response.id">
          {{ response.data }} ({{
            new Date(response.timestamp).toLocaleTimeString()
          }})
        </li>
      </ul>
    </div>

    <apiThrottler.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </apiThrottler.Subscribe>
  </div>
</template>
