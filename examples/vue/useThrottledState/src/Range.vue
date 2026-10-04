<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledState } from '@tanstack/vue-pacer/throttler'

const instantExecutionCount = ref(0)

const currentValue = ref(50)

const [throttledValue, setThrottledValue, throttler] = useThrottledState(
  currentValue.value,
  () => ({
    wait: 250,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  setThrottledValue(newValue)
  instantExecutionCount.value = instantExecutionCount.value + 1
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledState Example 3</h1>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          :style="{ width: '100%' }"
        /><span>{{ currentValue }}</span></label
      >
    </div>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Throttled Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="throttledValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ throttledValue }}</span></label
      >
    </div>
    <table>
      <tbody>
        <throttler.Subscribe
          :selector="(state) => ({ executionCount: state.executionCount })"
          v-slot="{ executionCount }"
          ><tr>
            <td>Instant Execution Count:</td>
            <td>{{ instantExecutionCount }}</td>
          </tr>
          <tr>
            <td>Throttled Execution Count:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {{ instantExecutionCount - executionCount }} ({{
                instantExecutionCount > 0
                  ? (
                      ((instantExecutionCount - executionCount) /
                        instantExecutionCount) *
                      100
                    ).toFixed(2)
                  : 0
              }}% Reduction in execution calls)
            </td>
          </tr></throttler.Subscribe
        >
      </tbody>
    </table>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Throttled to 1 update per 250ms</p>
    </div>
    <throttler.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </throttler.Subscribe>
  </div>
</template>
