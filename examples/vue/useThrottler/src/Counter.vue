<script setup lang="ts">
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

const instantCount = ref(0)

const throttledCount = ref(0)

const setCountThrottler = useThrottler(
  (value: typeof throttledCount.value) => {
    throttledCount.value = value
  },
  () => ({
    key: 'counter',
    wait: 1000,
    // leading: true, // default
    // trailing: true, // default
    // enabled: () => instantCount.value > 2,
  }),
)

function increment() {
  const nextCount = ++instantCount.value
  setCountThrottler.maybeExecute(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottler Example 1</h1>
    <table>
      <tbody>
        <setCountThrottler.Subscribe
          :selector="(state) => ({ executionCount: state.executionCount })"
          v-slot="{ executionCount }"
          ><tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{{ throttledCount }}</td>
          </tr></setCountThrottler.Subscribe
        >
      </tbody>
    </table>
    <div>
      <button @click="increment">Increment</button
      ><button
        @click="() => setCountThrottler.flush()"
        :style="{ marginLeft: '10px' }"
      >
        Flush
      </button>
    </div>
    <setCountThrottler.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </setCountThrottler.Subscribe>
  </div>
</template>
