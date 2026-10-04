<script setup lang="ts">
const alert = window.alert.bind(window)
import { ref } from 'vue'
import { useRateLimitedState } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const instantCountRef = ref(0)

const [limitedCount, setLimitedCount, rateLimiter] = useRateLimitedState(
  instantCount.value,
  () => ({
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
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
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setLimitedCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedState Example 1</h1>
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
        <rateLimiter.Subscribe
          :selector="
            (state) => ({
              executionCount: state.executionCount,
              rejectionCount: state.rejectionCount,
            })
          "
          v-slot="{ executionCount, rejectionCount }"
          ><tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{{ rejectionCount }}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{{ limitedCount }}</td>
          </tr></rateLimiter.Subscribe
        >
      </tbody>
    </table>
    <div>
      <button @click="increment">Increment</button
      ><button @click="() => alert(rateLimiter.getRemainingInWindow())">
        Remaining in Window</button
      ><button @click="() => alert(rateLimiter.reset())">Reset</button>
    </div>
    <rateLimiter.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </rateLimiter.Subscribe>
  </div>
</template>
