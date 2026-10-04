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
const instantSearch = ref('')

const limitedSearch = ref('')

const rateLimiter = useRateLimiter(
  (value: typeof limitedSearch.value) => {
    limitedSearch.value = value
  },
  () => ({
    key: 'search',
    enabled: () => instantSearch.value.length > 2, // optional, defaults to true
    ...commonRateLimiterOptions,
    // windowType: 'sliding', // default is 'fixed'
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearch.value = newValue
  rateLimiter.maybeExecute(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimiter Example 2</h1>
    <div>
      <input
        autofocus
        type="search"
        :value="instantSearch"
        @input="handleSearchChange"
        placeholder="Type to search..."
        :style="{ width: '100%' }"
      />
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
            <td>Instant Search:</td>
            <td>{{ instantSearch }}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{{ limitedSearch }}</td>
          </tr></rateLimiter.Subscribe
        >
      </tbody>
    </table>
    <div><button @click="() => rateLimiter.reset()">Reset</button></div>
    <rateLimiter.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </rateLimiter.Subscribe>
  </div>
</template>
