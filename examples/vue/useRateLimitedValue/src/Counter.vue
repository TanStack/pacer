<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedValue } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const [limitedCount] = useRateLimitedValue(
  () => instantCount.value,
  () => ({
    // enabled: () => instantCount > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: windowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function increment() {
  instantCount.value = instantCount.value + 1
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedValue Example 1</h1>
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
          <td>{{ limitedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
  </div>
</template>
