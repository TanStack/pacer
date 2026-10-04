<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer/debouncer'

const currentValue = ref(50)

const submittedCount = ref(1)

const [debouncedValue, debouncer] = useDebouncedValue(
  () => currentValue.value,
  () => ({
    wait: 250,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  submittedCount.value = submittedCount.value + 1
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncedValue Example 3</h1>
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
    <debouncer.Subscribe
      :selector="
        (state) => ({
          isPending: state.isPending,
          executionCount: state.executionCount,
        })
      "
      v-slot="{ isPending, executionCount }"
      ><table>
        <tbody>
          <tr>
            <td>Is Pending:</td>
            <td>{{ isPending.toString() }}</td>
          </tr>
          <tr>
            <td>Values Submitted:</td>
            <td>{{ submittedCount }}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>{{ executionCount }}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{{ submittedCount - executionCount }}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              <template v-if="submittedCount === 0">{{ '0' }}</template
              ><template v-else>{{
                Math.round(
                  ((submittedCount - executionCount) / submittedCount) * 100,
                )
              }}</template
              >%
            </td>
          </tr>
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Debounced to 250ms wait time</p>
      </div></debouncer.Subscribe
    >
    <pre
      :style="{ marginTop: '20px' }"
    ><debouncer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</debouncer.Subscribe></pre>
  </div>
</template>
