<script setup lang="ts">
const alert = window.alert.bind(window)
import { ref } from 'vue'
import { useRateLimitedState } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantSearch = ref('')

const instantSearchRef = ref('')

const [limitedSearch, setLimitedSearch, rateLimiter] = useRateLimitedState(
  instantSearch.value,
  () => ({
    // enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
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

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setLimitedSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedState Example 2</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType2"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType2"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
    <div>
      <input
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
    <div>
      <button @click="() => alert(rateLimiter.getRemainingInWindow())">
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
