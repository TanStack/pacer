<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

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

const instantExecutionCount = ref(0)

const currentValue = ref(50)

const throttledValue = ref(50)

const setValueThrottler = useThrottler(
  (value: typeof throttledValue.value) => {
    throttledValue.value = value
  },
  () => ({
    key: 'range',
    wait: 250,
    // leading: true, // default
    // trailing: true, // default
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  // instant state update
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  // throttled state update
  setValueThrottler.maybeExecute(newValue)
}
</script>

<template>
  <div>
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
    <hr />
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
      <div>
        <button @click="() => setSearchThrottler.flush()">Flush</button>
      </div>
      <setSearchThrottler.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </setSearchThrottler.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useThrottler Example 3</h1>
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
          <setValueThrottler.Subscribe
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
            </tr></setValueThrottler.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Throttled to 1 update per 250ms (trailing edge)</p>
      </div>
      <div><button @click="() => setValueThrottler.flush()">Flush</button></div>
      <setValueThrottler.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </setValueThrottler.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
