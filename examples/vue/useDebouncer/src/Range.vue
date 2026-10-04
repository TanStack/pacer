<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const currentValue = ref(50)
const debouncedValue = ref(50)
const instantExecutionCount = ref(0)
const wait = ref(250)
const enabled = ref(true)
const setValueDebouncer = useDebouncer(
  (value: number) => {
    debouncedValue.value = value
  },
  () => ({ key: 'range', wait: wait.value, enabled: enabled.value }),
)

function handleRangeChange(event: Event) {
  currentValue.value = (event.target as HTMLInputElement).valueAsNumber
  instantExecutionCount.value++
  setValueDebouncer.maybeExecute(currentValue.value)
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useDebouncer Example 3</h1>
    <fieldset>
      <legend>Reactive options</legend>
      <label>
        Delay: {{ wait }} ms<input
          type="range"
          min="0"
          max="1500"
          step="50"
          v-model.number="wait"
        />
      </label>
      <label><input type="checkbox" v-model="enabled" />Enabled</label>
      <p>
        Changing the delay affects the next scheduled call. Disabling cancels
        pending work.
      </p>
    </fieldset>
    <div style="margin-bottom: 20px">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          style="width: 100%"
        />
        <span>{{ currentValue }}</span>
      </label>
    </div>
    <div style="margin-bottom: 20px">
      <label
        >Debounced Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="debouncedValue"
          disabled
          style="width: 100%"
        />
        <span>{{ debouncedValue }}</span>
      </label>
    </div>
    <table>
      <tbody>
        <setValueDebouncer.Subscribe
          :selector="
            (state) => ({
              isPending: state.isPending,
              executionCount: state.executionCount,
            })
          "
          v-slot="{ isPending, executionCount }"
        >
          <tr>
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
              {{
                instantExecutionCount === 0
                  ? '0'
                  : Math.round(
                      ((instantExecutionCount - executionCount) /
                        instantExecutionCount) *
                        100,
                    )
              }}%
            </td>
          </tr>
        </setValueDebouncer.Subscribe>
      </tbody>
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Debounced to {{ wait }}ms wait time</p>
    </div>
    <div><button @click="setValueDebouncer.flush()">Flush</button></div>
    <setValueDebouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
    </setValueDebouncer.Subscribe>
  </div>
</template>
