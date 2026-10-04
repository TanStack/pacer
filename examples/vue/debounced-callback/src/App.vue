<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const instantCountRef = ref(0)

const debouncedCount = ref(0)

const debouncedSetCount = useDebouncer(
  (value: typeof debouncedCount.value) => {
    debouncedCount.value = value
  },
  () => ({
    wait: 500,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
).maybeExecute

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  debouncedSetCount(nextCount)
}

const searchText = ref('')

const searchTextRef = ref('')

const debouncedSearchText = ref('')

const debouncedSetSearch = useDebouncer(
  (value: typeof debouncedSearchText.value) => {
    debouncedSearchText.value = value
  },
  () => ({
    wait: 500,
    enabled: () => searchTextRef.value.length > 2,
  }),
).maybeExecute

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  debouncedSetSearch(newValue)
}

const currentValue = ref(50)

const debouncedValue = ref(50)

const debouncedSetValue = useDebouncer(
  (value: typeof debouncedValue.value) => {
    debouncedValue.value = value
  },
  () => ({
    wait: 250,
  }),
).maybeExecute

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  debouncedSetValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useDebouncer Example 1</h1>
      <table>
        <tbody>
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
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncer Example 2</h1>
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
            <td>Debounced Search:</td>
            <td>{{ debouncedSearchText }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncer Example 3</h1>
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
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Debounced to 250ms wait time</p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
