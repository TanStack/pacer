<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRateLimiter } from '@tanstack/vue-pacer/rate-limiter'

// Simulated API call log
const apiCallLog = ref<Array<{ id: number; timestamp: Date }>>([])
let apiCallId = 0

// Rate limiter: 5 calls per 10 seconds
const apiRateLimiter = useRateLimiter(
  () => {
    apiCallId++
    apiCallLog.value = [
      { id: apiCallId, timestamp: new Date() },
      ...apiCallLog.value.slice(0, 9),
    ]
  },
  { limit: 5, window: 10000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    isExceeded: state.isExceeded,
    status: state.status,
  }),
)

const remainingCalls = computed(() => apiRateLimiter.getRemainingInWindow())
const msUntilReset = computed(() => apiRateLimiter.getMsUntilNextWindow())

function handleApiCall() {
  const success = apiRateLimiter.maybeExecute()
  if (!success) {
    console.log('Rate limit exceeded!')
  }
}

// Button click rate limiter: 3 clicks per 5 seconds
const clickCount = ref(0)
const clickLog = ref<Array<{ allowed: boolean; timestamp: Date }>>([])

const clickRateLimiter = useRateLimiter(
  () => {
    clickCount.value++
  },
  { limit: 3, window: 5000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    isExceeded: state.isExceeded,
  }),
)

function handleClick() {
  const allowed = clickRateLimiter.maybeExecute()
  clickLog.value = [
    { allowed, timestamp: new Date() },
    ...clickLog.value.slice(0, 4),
  ]
}

// Sliding window example: 2 submissions per 3 seconds
const submissionLog = ref<Array<{ id: number; timestamp: Date }>>([])
let submissionId = 0

const formRateLimiter = useRateLimiter(
  () => {
    submissionId++
    submissionLog.value = [
      { id: submissionId, timestamp: new Date() },
      ...submissionLog.value.slice(0, 4),
    ]
  },
  { limit: 2, window: 3000, windowType: 'sliding' },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    isExceeded: state.isExceeded,
    executionTimes: state.executionTimes,
  }),
)

function handleSubmit() {
  formRateLimiter.maybeExecute()
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useRateLimiter Example</h1>

    <!-- API Call Rate Limiting -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>API Rate Limiting (5 calls per 10 seconds)</h2>
      <button
        @click="handleApiCall"
        :disabled="apiRateLimiter.state.value.isExceeded"
        :style="{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: apiRateLimiter.state.value.isExceeded
            ? 'not-allowed'
            : 'pointer',
          backgroundColor: apiRateLimiter.state.value.isExceeded
            ? '#ccc'
            : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }"
      >
        Make API Call
      </button>
      <div style="margin-top: 15px">
        <p>
          <strong>Status:</strong>
          <span
            :style="{
              color:
                apiRateLimiter.state.value.status === 'exceeded'
                  ? '#e53e3e'
                  : '#38a169',
            }"
          >
            {{ apiRateLimiter.state.value.status }}
          </span>
        </p>
        <p><strong>Remaining Calls:</strong> {{ remainingCalls }} / 5</p>
        <p>
          <strong>Time Until Reset:</strong>
          {{
            msUntilReset > 0 ? `${(msUntilReset / 1000).toFixed(1)}s` : 'Ready'
          }}
        </p>
        <p>
          <strong>Total Executions:</strong>
          {{ apiRateLimiter.state.value.executionCount }}
        </p>
        <p>
          <strong>Total Rejections:</strong>
          {{ apiRateLimiter.state.value.rejectionCount }}
        </p>
      </div>
      <div v-if="apiCallLog.length > 0" style="margin-top: 10px">
        <strong>Recent API Calls:</strong>
        <ul style="margin: 5px 0; padding-left: 20px">
          <li v-for="call in apiCallLog" :key="call.id">
            Call #{{ call.id }} at {{ call.timestamp.toLocaleTimeString() }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Click Rate Limiting -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Click Rate Limiting (3 clicks per 5 seconds)</h2>
      <button
        @click="handleClick"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer"
      >
        Click me fast!
      </button>
      <div style="margin-top: 15px">
        <p><strong>Successful Clicks:</strong> {{ clickCount }}</p>
        <p>
          <strong>Remaining:</strong>
          {{ clickRateLimiter.getRemainingInWindow() }} / 3
        </p>
        <p>
          <strong>Rejected Clicks:</strong>
          {{ clickRateLimiter.state.value.rejectionCount }}
        </p>
        <p>
          <strong>Rate Limited:</strong>
          {{ clickRateLimiter.state.value.isExceeded ? 'Yes' : 'No' }}
        </p>
      </div>
      <div v-if="clickLog.length > 0" style="margin-top: 10px">
        <strong>Click History:</strong>
        <ul style="margin: 5px 0; padding-left: 20px">
          <li
            v-for="(click, index) in clickLog"
            :key="index"
            :style="{ color: click.allowed ? '#38a169' : '#e53e3e' }"
          >
            {{ click.allowed ? 'Allowed' : 'Rejected' }} at
            {{ click.timestamp.toLocaleTimeString() }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Sliding Window Example -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Form Submission (Sliding Window: 2 per 3 seconds)</h2>
      <button
        @click="handleSubmit"
        :style="{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: formRateLimiter.state.value.isExceeded
            ? '#e53e3e'
            : '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }"
      >
        Submit Form
      </button>
      <div style="margin-top: 15px">
        <p>
          <strong>Submissions:</strong>
          {{ formRateLimiter.state.value.executionCount }}
        </p>
        <p>
          <strong>Rejections:</strong>
          {{ formRateLimiter.state.value.rejectionCount }}
        </p>
        <p>
          <strong>Window Type:</strong> Sliding (allows new calls as old ones
          expire)
        </p>
      </div>
      <div v-if="submissionLog.length > 0" style="margin-top: 10px">
        <strong>Submission Log:</strong>
        <ul style="margin: 5px 0; padding-left: 20px">
          <li v-for="submission in submissionLog" :key="submission.id">
            Submission #{{ submission.id }} at
            {{ submission.timestamp.toLocaleTimeString() }}
          </li>
        </ul>
      </div>
    </div>

    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px">
      <h3>How it works</h3>
      <p>
        Rate limiting restricts function execution to a maximum number of calls
        within a time window. Unlike throttling (which spaces out calls) or
        debouncing (which waits for inactivity), rate limiting allows burst
        execution up to the limit, then blocks until the window resets.
      </p>
      <p style="margin-top: 10px">
        <strong>Fixed Window:</strong> Counts calls from the first execution,
        resets after window expires.
      </p>
      <p>
        <strong>Sliding Window:</strong> Each call expires individually,
        allowing new calls as old ones age out.
      </p>
    </div>
  </div>
</template>
