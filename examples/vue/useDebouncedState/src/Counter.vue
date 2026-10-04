<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedState } from '@tanstack/vue-pacer/debouncer'

const instantCount = ref(0)

const instantCountRef = ref(0)

const [debouncedCount, setDebouncedCount, debouncer] = useDebouncedState(
  instantCount.value,
  () => ({
    wait: 500,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setDebouncedCount(nextCount)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncedState Example 1</h1>
    <table>
      <tbody>
        <debouncer.Subscribe
          :selector="
            (state) => ({
              isPending: state.isPending,
              executionCount: state.executionCount,
            })
          "
          v-slot="{ isPending, executionCount }"
          ><tr>
            <td>Is Pending:</td>
            <td>{{ isPending.toString() }}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td :colspan="2"><hr /></td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{{ debouncedCount }}</td>
          </tr></debouncer.Subscribe
        >
      </tbody>
    </table>
    <div><button @click="increment">Increment</button></div>
    <debouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </debouncer.Subscribe>
  </div>
</template>
