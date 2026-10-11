<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { debounce } from '@tanstack/vue-pacer/debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const debouncedCount = ref(0)

// Create debounced setter function - Stable reference required!
const debouncedSetCount = debounce(
  (value: typeof debouncedCount.value) => (debouncedCount.value = value),
  {
    wait: 500,
    // leading: true, // optional, defaults to false
  },
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    debouncedSetCount(newInstantCount) // debounced state update
    return newInstantCount // instant state update
  })(instantCount.value)
}

const searchText = ref('')

const debouncedSearchText = ref('')

// Create debounced setter function - Stable reference required!
const debouncedSetSearch = debounce(
  (value: typeof debouncedSearchText.value) =>
    (debouncedSearchText.value = value),
  {
    wait: 500,
  },
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchText.value = newValue
  debouncedSetSearch(newValue)
}

const instantValue = ref(50)

const debouncedValue = ref(50)

// Create debounced setter function - Stable reference required!
const debouncedSetValue = debounce(
  (value: typeof debouncedValue.value) => (debouncedValue.value = value),
  {
    wait: 250,
  },
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  instantValue.value = newValue
  debouncedSetValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer debounce Example 1</h1>
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
      <h1>TanStack Pacer debounce Example 2</h1>
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
      <h1>TanStack Pacer debounce Example 3</h1>
      <div :style="{ marginBottom: '20px' }">
        <label
          >Instant Range:<input
            type="range"
            min="0"
            max="100"
            :value="instantValue"
            @input="handleRangeChange"
            :style="{ width: '100%' }"
          /><span>{{ instantValue }}</span></label
        >
      </div>
      <div>
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
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
