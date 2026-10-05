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
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

const error = ref<Error | null>(null)

// The function that will become throttled
const handleSearch = async (term: string) => {
  if (!term) {
    results.value = []
    return
  }
  // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
  const data = await fakeApi(term)
  results.value = data
  error.value = null
  return data // this could alternatively be a void function without a return
}

const setSearchAsyncThrottler = useAsyncThrottler(handleSearch, () => ({
  key: 'useAsyncThrottler',
  // leading: true, // default
  // trailing: true, // default
  wait: 1000, // Wait 1 second between API calls
  onError: (cause) => {
    // optional error handler
    console.error('Search failed:', cause)
    error.value = cause as Error
    results.value = []
  },
  // throwOnError: true,
}))

// get and name our throttled function
const handleSearchThrottled = setSearchAsyncThrottler.maybeExecute

// instant event handler that calls both the instant local state setter and the throttled function
async function onSearchChange(e: Event) {
  const newTerm = (e.target as HTMLInputElement).value
  searchTerm.value = newTerm
  const result = await handleSearchThrottled(newTerm) // optionally await if you need to
  console.log('result', result)
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncThrottler Example</h1>
    <div>
      <input
        autofocus
        type="search"
        :value="searchTerm"
        @input="onSearchChange"
        placeholder="Type to search..."
        :style="{ width: '100%' }"
        autocomplete="new-password"
      />
    </div>
    <div :style="{ marginTop: '10px' }">
      <button @click="() => setSearchAsyncThrottler.flush()">Flush</button>
    </div>
    <template v-if="error"
      ><div>Error: {{ error.message }}</div></template
    ><setSearchAsyncThrottler.Subscribe
      :selector="
        (state) => ({
          isExecuting: state.isExecuting,
          isPending: state.isPending,
          successCount: state.successCount,
        })
      "
      v-slot="{ isExecuting, isPending, successCount }"
      ><div>
        <p>API calls made: {{ successCount }}</p>
        <template v-if="results.length > 0"
          ><ul>
            <template v-for="(item, index) in results" :key="index"
              ><li>{{ item.title }}</li></template
            >
          </ul></template
        ><template v-if="isPending"><p>Pending...</p></template
        ><template v-else
          ><template v-if="isExecuting"><p>Executing...</p></template
          ><template v-else></template
        ></template></div></setSearchAsyncThrottler.Subscribe
    ><setSearchAsyncThrottler.Subscribe
      :selector="(state) => state"
      v-slot="state"
    >
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </setSearchAsyncThrottler.Subscribe>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
