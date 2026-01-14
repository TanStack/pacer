<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAsyncRateLimiter } from '@tanstack/vue-pacer/async-rate-limiter'

interface ApiResponse {
  id: number
  data: string
  timestamp: number
}

const responses = ref<Array<ApiResponse>>([])
const error = ref<string | null>(null)
let requestId = 0

// Simulated API call
async function fetchAPI(id: number): Promise<ApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate occasional errors
  if (id % 5 === 0) {
    throw new Error(`Request ${id} failed: Server error`)
  }

  return {
    id,
    data: `Response for request #${id}`,
    timestamp: Date.now(),
  }
}

// Rate limiter: 3 calls per 5 seconds
const apiLimiter = useAsyncRateLimiter(
  async () => {
    requestId++
    error.value = null
    const response = await fetchAPI(requestId)
    responses.value = [response, ...responses.value].slice(0, 10)
    return response
  },
  {
    limit: 3,
    window: 5000,
    onError: (err) => {
      error.value = err.message
    },
  },
  (state) => ({
    isExecuting: state.isExecuting,
    isExceeded: state.isExceeded,
    status: state.status,
    successCount: state.successCount,
    errorCount: state.errorCount,
    rejectionCount: state.rejectionCount,
    settleCount: state.settleCount,
    maybeExecuteCount: state.maybeExecuteCount,
  }),
)

const executionsRemaining = computed(() => apiLimiter.getRemainingInWindow())
const msUntilReset = computed(() => apiLimiter.getMsUntilNextWindow())

function handleApiCall() {
  apiLimiter.maybeExecute()
}

function handleClear() {
  requestId = 0
  responses.value = []
  error.value = null
  apiLimiter.reset()
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useAsyncRateLimiter Example</h1>
    <p>
      Rate-limited async API calls: 3 calls per 5 seconds. Unlike synchronous
      rate limiting, this tracks async execution state.
    </p>

    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Rate-Limited API Calls</h2>

      <div style="margin-bottom: 15px">
        <button
          @click="handleApiCall"
          :disabled="
            apiLimiter.state.value.isExceeded ||
            apiLimiter.state.value.isExecuting
          "
          :style="{
            padding: '10px 20px',
            fontSize: '16px',
            cursor:
              apiLimiter.state.value.isExceeded ||
              apiLimiter.state.value.isExecuting
                ? 'not-allowed'
                : 'pointer',
            backgroundColor: apiLimiter.state.value.isExceeded
              ? '#e53e3e'
              : apiLimiter.state.value.isExecuting
                ? '#805ad5'
                : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }"
        >
          {{
            apiLimiter.state.value.isExecuting
              ? 'Executing...'
              : apiLimiter.state.value.isExceeded
                ? 'Rate Limited'
                : 'Make API Call'
          }}
        </button>
        <button
          @click="handleClear"
          style="
            margin-left: 10px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
          "
        >
          Reset
        </button>
      </div>

      <table style="border-collapse: collapse; width: 100%; max-width: 400px">
        <tbody>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">Status:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              <strong
                :style="{
                  color:
                    apiLimiter.state.value.status === 'exceeded'
                      ? '#e53e3e'
                      : apiLimiter.state.value.status === 'executing'
                        ? '#805ad5'
                        : '#38a169',
                }"
              >
                {{ apiLimiter.state.value.status }}
              </strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Is Executing:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.isExecuting }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Is Exceeded:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.isExceeded }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Executions Remaining:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ executionsRemaining }} / 3
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Time Until Reset:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{
                msUntilReset > 0
                  ? `${(msUntilReset / 1000).toFixed(1)}s`
                  : 'Ready'
              }}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px">
              <hr />
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Maybe Execute Count:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.maybeExecuteCount }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Success Count:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.successCount }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Error Count:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.errorCount }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Settle Count:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.settleCount }}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              Rejection Count:
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee">
              {{ apiLimiter.state.value.rejectionCount }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="error"
        style="
          margin-top: 15px;
          padding: 10px;
          background: #fed7d7;
          color: #c53030;
          border-radius: 4px;
        "
      >
        {{ error }}
      </div>

      <div v-if="responses.length > 0" style="margin-top: 15px">
        <strong>Recent Responses:</strong>
        <ul style="margin: 5px 0; padding-left: 20px">
          <li v-for="response in responses" :key="response.id">
            {{ response.data }} ({{
              new Date(response.timestamp).toLocaleTimeString()
            }})
          </li>
        </ul>
      </div>
    </div>

    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px">
      <h3>How it works</h3>
      <p>
        <code>useAsyncRateLimiter</code> combines rate limiting with async
        execution tracking. It limits how many times an async function can be
        called within a time window while also tracking execution state.
      </p>
      <ul style="margin-top: 10px; padding-left: 20px">
        <li>
          <strong>isExecuting:</strong> True while the async function is running
        </li>
        <li><strong>isExceeded:</strong> True when rate limit is reached</li>
        <li><strong>successCount/errorCount:</strong> Tracks async outcomes</li>
        <li><strong>rejectionCount:</strong> Calls blocked by rate limit</li>
      </ul>
    </div>
  </div>
</template>
