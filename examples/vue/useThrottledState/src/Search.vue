<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledState } from '@tanstack/vue-pacer/throttler'

const instantSearch = ref('')

const instantSearchRef = ref('')

const [throttledSearch, setThrottledSearch, throttler] = useThrottledState(
  instantSearch.value,
  () => ({
    wait: 1000,
    // enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setThrottledSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledState Example 2</h1>
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
        <throttler.Subscribe
          :selector="(state) => ({ executionCount: state.executionCount })"
          v-slot="{ executionCount }"
          ><tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{{ instantSearch }}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{{ throttledSearch }}</td>
          </tr></throttler.Subscribe
        >
      </tbody>
    </table>
    <throttler.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </throttler.Subscribe>
  </div>
</template>
