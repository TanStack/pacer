<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useThrottledState } from '@tanstack/vue-pacer/throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const instantCountRef = ref(0)

const [throttledCount, setThrottledCount, counterThrottler] = useThrottledState(
  instantCount.value,
  () => ({
    wait: 1000,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setThrottledCount(nextCount)
}

const instantSearch = ref('')

const instantSearchRef = ref('')

const [throttledSearch, setThrottledSearch, searchThrottler] =
  useThrottledState(instantSearch.value, () => ({
    wait: 1000,
    // enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
  }))

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setThrottledSearch(newValue)
}

const instantExecutionCount = ref(0)

const currentValue = ref(50)

const [throttledValue, setThrottledValue, rangeThrottler] = useThrottledState(
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
    <div>
      <h1>TanStack Pacer useThrottledState Example 1</h1>
      <table>
        <tbody>
          <counterThrottler.Subscribe
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
            </tr></counterThrottler.Subscribe
          >
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
      <counterThrottler.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </counterThrottler.Subscribe>
    </div>
    <hr />
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
          <searchThrottler.Subscribe
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
            </tr></searchThrottler.Subscribe
          >
        </tbody>
      </table>
      <searchThrottler.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </searchThrottler.Subscribe>
    </div>
    <hr />
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
          <rangeThrottler.Subscribe
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
            </tr></rangeThrottler.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Throttled to 1 update per 250ms</p>
      </div>
      <rangeThrottler.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </rangeThrottler.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
