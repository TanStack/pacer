<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncThrottler } from '@tanstack/vue-pacer/async-throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface SearchResult {
  id: number
  title: string
}
// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  if (term === 'error') {
    throw new Error('Simulated API error')
  }
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

const isLoading = ref(false)

const error = ref<string | null>(null)

const throttledSearch = useAsyncThrottler(
  async (term: string) => {
    if (!term.trim()) {
      results.value = []
      return []
    }
    isLoading.value = true
    error.value = null
    try {
      const data = await fakeApi(term)
      results.value = data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      results.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  },
  () => ({
    wait: 1000,
    // leading: true, // optional, defaults to true
    // trailing: true, // optional, defaults to true
  }),
).maybeExecute

async function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTerm.value = newValue
  try {
    await throttledSearch(newValue)
  } catch (err) {
    // Error is already handled in the throttled function
    console.log('Search failed:', err)
  }
}

const count = ref(0)

const apiCallCount = ref(0)

// Simulate API call that returns a value
const incrementApi = async (value: number): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newCount = value + 1
  apiCallCount.value = apiCallCount.value + 1
  return newCount
}

const throttledIncrement = useAsyncThrottler(
  async (currentValue: number) => {
    const result = await incrementApi(currentValue)
    count.value = result
    return result
  },
  () => ({
    wait: 1000,
    leading: true, // Execute immediately on first call
    trailing: true, // Execute after throttle period ends
  }),
).maybeExecute

function handleIncrement() {
  // Update local state immediately for instant feedback
  count.value = ((prev) => {
    const newCount = prev + 1
    throttledIncrement(newCount)
    return newCount
  })(count.value)
}

const scrollPosition = ref(0)

const saveCount = ref(0)

const lastSaved = ref<Date | null>(null)

const isSaving = ref(false)

// Simulate saving scroll position to server
const saveScrollPosition = async (
  position: number,
): Promise<{
  success: boolean
  position: number
}> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, position }
}

const throttledSave = useAsyncThrottler(
  async (position: number) => {
    isSaving.value = true
    try {
      const result = await saveScrollPosition(position)
      saveCount.value = saveCount.value + 1
      lastSaved.value = new Date()
      return result
    } finally {
      isSaving.value = false
    }
  },
  () => ({
    wait: 1000,
    leading: true,
    trailing: true,
  }),
).maybeExecute

function handleScroll(e: Event) {
  const position = (e.currentTarget as HTMLInputElement).scrollTop
  scrollPosition.value = position
  throttledSave(position)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useAsyncThrottler Example 1</h1>
      <div>
        <input
          type="search"
          :value="searchTerm"
          @input="handleSearchChange"
          placeholder="Type to search... (try 'error' to see error handling)"
          :style="{ width: '100%', marginBottom: '10px' }"
        />
      </div>
      <template v-if="isLoading"
        ><p :style="{ color: 'blue' }">Searching...</p></template
      ><template v-if="error"
        ><p :style="{ color: 'red' }">Error: {{ error }}</p></template
      >
      <div>
        <p>Current search term: {{ searchTerm }}</p>
        <template v-if="results.length > 0"
          ><div>
            <h3>Results:</h3>
            <ul>
              <template v-for="(result, index) in results" :key="index"
                ><li>{{ result.title }}</li></template
              >
            </ul>
          </div></template
        >
      </div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncThrottler Example 2</h1>
      <table>
        <tbody>
          <tr>
            <td>Current Count:</td>
            <td>{{ count }}</td>
          </tr>
          <tr>
            <td>API Calls Made:</td>
            <td>{{ apiCallCount }}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click="handleIncrement">Increment (throttled API call)</button>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Click rapidly - API calls are throttled to 1 second, but UI updates
        immediately. First click executes immediately, then at most once per
        second.
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncThrottler Example 3</h1>
      <div
        :style="{
          height: '200px',
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px',
        }"
        @scroll="handleScroll"
      >
        <div :style="{ height: '1000px' }">
          <p>Scroll this area to trigger throttled saves!</p>
          <p>Current scroll position: {{ Math.round(scrollPosition) }}px</p>
          <template v-if="isSaving"
            ><p :style="{ color: 'blue' }">Saving position...</p></template
          >
          <div :style="{ marginTop: '20px' }">
            <p>Saves triggered: {{ saveCount }}</p>
            <template v-if="lastSaved"
              ><p>
                Last saved at: {{ lastSaved.toLocaleTimeString() }}
              </p></template
            >
          </div>
          <div :style="{ marginTop: '40px' }">
            <p>Keep scrolling...</p>
            <p :style="{ marginTop: '100px' }">More content...</p>
            <p :style="{ marginTop: '100px' }">Even more content...</p>
            <p :style="{ marginTop: '100px' }">Almost there...</p>
            <p :style="{ marginTop: '100px' }">You made it to the end!</p>
          </div>
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Scroll position is saved at most once per second, but updates instantly
        on screen
      </p>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
