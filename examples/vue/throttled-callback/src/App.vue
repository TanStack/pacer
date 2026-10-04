<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const instantCountRef = ref(0)

const throttledCount = ref(0)

const throttledSetCount = useThrottler(
  (value: typeof throttledCount.value) => {
    throttledCount.value = value
  },
  () => ({
    wait: 1000,
    enabled: () => instantCountRef.value > 2,
  }),
).maybeExecute

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  throttledSetCount(nextCount)
}

const searchText = ref('')

const searchTextRef = ref('')

const throttledSearchText = ref('')

const throttledSetSearch = useThrottler(
  (value: typeof throttledSearchText.value) => {
    throttledSearchText.value = value
  },
  () => ({
    wait: 1000,
    enabled: () => searchTextRef.value.length > 2,
  }),
).maybeExecute

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  throttledSetSearch(newValue)
}

const currentValue = ref(50)

const throttledValue = ref(50)

const throttledSetValue = useThrottler(
  (value: typeof throttledValue.value) => {
    throttledValue.value = value
  },
  () => ({
    wait: 250,
  }),
).maybeExecute

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  throttledSetValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useThrottler Example 1</h1>
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
      <h1>TanStack Pacer useThrottler Example 2</h1>
      <div>
        <input
          type="search"
          :value="searchText"
          @input="handleSearchChange"
          placeholder="Type to search..."
          :style="{ width: '100%' }"
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{{ searchText }}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{{ throttledSearchText }}</td>
          </tr>
        </tbody>
      </table>
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
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Throttled to 1 update per 250ms</p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
