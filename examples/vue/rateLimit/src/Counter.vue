<script setup lang="ts">
import { computed, ref } from 'vue'
import { rateLimit } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const rateLimitedCount = ref(0)

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetCount = computed(() =>
  rateLimit(
    (value: typeof rateLimitedCount.value) => (rateLimitedCount.value = value),
    {
      limit: 5,
      window: 5000,
      windowType: windowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    rateLimitedSetCount.value(newInstantCount) // rate-limited state update
    return newInstantCount // instant state update
  })(instantCount.value)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer rateLimit Example 1</h1>
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
          <td>Rate Limited Count:</td>
          <td>{{ rateLimitedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
