<script setup lang="ts">
import { ref } from 'vue'
import {
  rateLimiterOptions,
  useRateLimiter,
} from '@tanstack/vue-pacer/rate-limiter'
const commonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 5000,
})
const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const limitedCount = ref(0)

const rateLimiter = useRateLimiter(
  (value: typeof limitedCount.value) => {
    limitedCount.value = value
  },
  () => ({
    key: 'counter',
    // enabled: () => instantCount.value > 2,
    ...commonRateLimiterOptions,
    windowType: windowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function increment() {
  const nextCount = ++instantCount.value
  rateLimiter.maybeExecute(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimiter Example 1</h1>
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
            <td>Remaining in Window:</td>
            <td>{{ rateLimiter.getRemainingInWindow() }}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>{{ rateLimiter.getMsUntilNextWindow() }}</td>
          </tr>
          <tr>
            <td :colspan="2"><hr /></td>
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
      ><button @click="() => rateLimiter.reset()">Reset</button>
    </div>
    <rateLimiter.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </rateLimiter.Subscribe>
  </div>
</template>
