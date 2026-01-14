<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedRef } from '@tanstack/vue-pacer/rate-limiter'

const clickCount = ref(0)

const [rateLimitedCount, setRateLimitedCount, rateLimiter] = useRateLimitedRef(
  0,
  { limit: 3, window: 5000 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    remainingInWindow: state.remainingInWindow,
    status: state.status,
  }),
)

function handleClick() {
  clickCount.value++
  setRateLimitedCount(clickCount.value)
}

function handleReset() {
  clickCount.value = 0
  rateLimiter.reset()
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useRateLimitedRef Example</h1>

    <div style="margin-bottom: 20px">
      <button
        @click="handleClick"
        style="padding: 12px 24px; font-size: 16px; cursor: pointer"
      >
        Click Me ({{ clickCount }})
      </button>
      <button
        @click="handleReset"
        style="
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
        "
      >
        Reset
      </button>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Values</h3>
      <p><strong>Instant Click Count:</strong> {{ clickCount }}</p>
      <p><strong>Rate Limited Count:</strong> {{ rateLimitedCount }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Rate Limiter State</h3>
      <p><strong>Status:</strong> {{ rateLimiter.state.value.status }}</p>
      <p>
        <strong>Is Pending:</strong> {{ rateLimiter.state.value.isPending }}
      </p>
      <p>
        <strong>Execution Count:</strong>
        {{ rateLimiter.state.value.executionCount }}
      </p>
      <p>
        <strong>Remaining in Window:</strong>
        {{ rateLimiter.state.value.remainingInWindow }}
      </p>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        The instant count updates on every click, but the rate-limited count
        only allows 3 updates per 5 seconds. Keep clicking rapidly to see the
        difference!
      </p>
    </div>
  </div>
</template>
