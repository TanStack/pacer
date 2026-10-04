<script setup lang="ts">
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

const instantSearch = ref('')

const throttledSearch = ref('')

const setSearchThrottler = useThrottler(
  (value: typeof throttledSearch.value) => {
    throttledSearch.value = value
  },
  () => ({
    key: 'search',
    wait: 1000,
    enabled: () => instantSearch.value.length > 2,
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearch.value = newValue
  setSearchThrottler.maybeExecute(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottler Example 2</h1>
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
        <setSearchThrottler.Subscribe
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
          </tr></setSearchThrottler.Subscribe
        >
      </tbody>
    </table>
    <div><button @click="() => setSearchThrottler.flush()">Flush</button></div>
    <setSearchThrottler.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </setSearchThrottler.Subscribe>
  </div>
</template>
