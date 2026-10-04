<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedState } from '@tanstack/vue-pacer/debouncer'

const currentValue = ref(50)

const instantExecutionCount = ref(0)

const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedState(
  currentValue.value,
  () => ({
    wait: 250,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  setDebouncedValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncedState Example 3</h1>
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
        >Debounced Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="debouncedValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ debouncedValue }}</span></label
      >
    </div>
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
            <td>Instant Executions:</td>
            <td>{{ instantExecutionCount }}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{{ instantExecutionCount - executionCount }}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              <template v-if="instantExecutionCount === 0">{{ '0' }}</template
              ><template v-else>{{
                Math.round(
                  ((instantExecutionCount - executionCount) /
                    instantExecutionCount) *
                    100,
                )
              }}</template
              >%
            </td>
          </tr></debouncer.Subscribe
        >
      </tbody>
    </table>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Debounced to 250ms wait time</p>
    </div>
    <debouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </debouncer.Subscribe>
  </div>
</template>
