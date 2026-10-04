<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedCallback } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const instantCountRef = ref(0)

const rateLimitedCount = ref(0)

const rateLimitedSetCount = useRateLimitedCallback(
  (value: typeof rateLimitedCount.value) => {
    rateLimitedCount.value = value
  },
  () => ({
    limit: 5,
    window: 5000,
    windowType: windowType.value,
    enabled: () => instantCountRef.value > 2,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  rateLimitedSetCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedCallback Example 1</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Count:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>RateLimited Count:</td>
          <td>{{ rateLimitedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
