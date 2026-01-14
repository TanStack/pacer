<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedCallback } from '@tanstack/vue-pacer/rate-limiter'

const clickCount = ref(0)
const executedCount = ref(0)
const rejectedCount = ref(0)

const [rateLimitedClick, rateLimiter] = useRateLimitedCallback(
  () => {
    executedCount.value++
    console.log('Rate-limited callback executed!')
  },
  { limit: 3, window: 5000 },
  (state) => ({
    executionCount: state.executionCount,
    rejectionCount: state.rejectionCount,
    remainingInWindow: state.remainingInWindow,
    msUntilNextWindow: state.msUntilNextWindow,
  }),
)

function handleClick() {
  clickCount.value++
  const result = rateLimitedClick()
  if (result === undefined) {
    rejectedCount.value++
  }
}

function handleReset() {
  rateLimiter.reset()
  clickCount.value = 0
  executedCount.value = 0
  rejectedCount.value = 0
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useRateLimitedCallback Example</h1>

    <div style="margin-bottom: 20px">
      <button
        @click="handleClick"
        style="
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        "
      >
        Click Me (Rate Limited)
      </button>
      <button
        @click="handleReset"
        style="padding: 12px 24px; font-size: 16px; cursor: pointer"
      >
        Reset
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Click Stats</h3>
      <p><strong>Total Clicks:</strong> {{ clickCount }}</p>
      <p><strong>Executed:</strong> {{ executedCount }}</p>
      <p><strong>Rejected:</strong> {{ rejectedCount }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Rate Limiter State</h3>
      <p>
        <strong>Execution Count:</strong>
        {{ rateLimiter.state.value.executionCount }}
      </p>
      <p>
        <strong>Rejection Count:</strong>
        {{ rateLimiter.state.value.rejectionCount }}
      </p>
      <p>
        <strong>Remaining in Window:</strong>
        {{ rateLimiter.state.value.remainingInWindow }}
      </p>
      <p>
        <strong>Ms Until Next Window:</strong>
        {{ rateLimiter.state.value.msUntilNextWindow }}
      </p>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        This example limits the callback to 3 executions per 5 second window.
        Click rapidly to see excess clicks get rejected. The rate limiter
        automatically resets after the window expires.
      </p>
    </div>
  </div>
</template>
