<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const instantCount = ref(0)
const debouncedCount = ref(0)
const debouncer = useDebouncer(
  (count: number) => {
    debouncedCount.value = count
  },
  {
    key: 'counter',
    wait: 800,
    enabled: () => instantCount.value > 2,
    // leading: true, // optional, defaults to false
  },
  // Alternative to Subscribe: select state here to update this component.
  // (state) => state,
)

function increment() {
  debouncer.maybeExecute(++instantCount.value)
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useDebouncer Example 1</h1>
    <table>
      <tbody>
        <debouncer.Subscribe
          :selector="
            (state) => ({
              status: state.status,
              executionCount: state.executionCount,
            })
          "
          v-slot="{ status, executionCount }"
        >
          <tr>
            <td>Status:</td>
            <td>{{ status }}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
        </debouncer.Subscribe>
        <tr>
          <td colspan="2"><hr /></td>
        </tr>
        <tr>
          <td>Instant Count:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>Debounced Count:</td>
          <td>{{ debouncedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="increment">Increment</button>
      <button @click="debouncer.flush()" style="margin-left: 10px">
        Flush
      </button>
    </div>
    <debouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </debouncer.Subscribe>
  </div>
</template>
