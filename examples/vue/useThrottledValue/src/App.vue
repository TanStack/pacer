<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useThrottledValue } from '@tanstack/vue-pacer/throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

function increment() {
  instantCount.value = instantCount.value + 1
}

const [throttledCount] = useThrottledValue(
  () => instantCount.value,
  () => ({
    wait: 1000,
    // enabled: () => instantCount > 2, // optional, defaults to true
  }),
)

const instantSearch = ref('')

const [throttledSearch] = useThrottledValue(
  () => instantSearch.value,
  () => ({
    wait: 1000,
    // enabled: instantSearch.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}

const submittedCount = ref(1)

const currentValue = ref(50)

const [throttledValue, throttler] = useThrottledValue(
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
    <div>
      <h1>TanStack Pacer useThrottledValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{{ throttledCount }}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useThrottledValue Example 2</h1>
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
          <tr>
            <td>Instant Search:</td>
            <td>{{ instantSearch }}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{{ throttledSearch }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useThrottledValue Example 3</h1>
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
      <throttler.Subscribe
        :selector="
          (state) => ({
            executionCount: state.executionCount,
          })
        "
        v-slot="{ executionCount }"
        ><table>
          <tbody>
            <tr>
              <td>Values Submitted:</td>
              <td>{{ submittedCount }}</td>
            </tr>
            <tr>
              <td>Throttled Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Saved Executions:</td>
              <td>
                {{ submittedCount - executionCount }} ({{
                  submittedCount > 0
                    ? (
                        ((submittedCount - executionCount) / submittedCount) *
                        100
                      ).toFixed(2)
                    : 0
                }}% Reduction in execution calls)
              </td>
            </tr>
          </tbody>
        </table>
        <div :style="{ color: '#666', fontSize: '0.9em' }">
          <p>Throttled to 1 update per 250ms</p>
        </div></throttler.Subscribe
      >
      <pre
        :style="{ marginTop: '20px' }"
      ><throttler.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</throttler.Subscribe></pre>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
