<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncDebouncer } from '@tanstack/vue-pacer/async-debouncer'
interface SearchResult {
  id: number
  title: string
}
// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

// The function that will become debounced
const handleSearch = async (term: string) => {
  if (!term) {
    results.value = []
    return
  }
  // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
  const data = await fakeApi(term)
  results.value = data
  return data // this could alternatively be a void function without a return
}

const asyncDebouncer = useAsyncDebouncer(handleSearch, () => ({
  key: 'useAsyncDebouncer',
  // leading: true, // optional leading execution
  wait: 500, // Wait 500ms between API calls
  onError: (error) => {
    // optional error handler
    console.error('Search failed:', error)
    results.value = []
  },
  // throwOnError: true,
  asyncRetryerOptions: {
    maxAttempts: 3,
    maxExecutionTime: 3000,
  },
}))

// get and name our debounced function
const handleSearchDebounced = asyncDebouncer.maybeExecute

// instant event handler that calls both the instant local state setter and the debounced function
async function onSearchChange(e: Event) {
  const newTerm = (e.target as HTMLInputElement).value
  searchTerm.value = newTerm
  const result = await handleSearchDebounced(newTerm) // optionally await result if you need to
  console.log('result', result)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncDebouncer Example</h1>
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
      <button @click="() => asyncDebouncer.flush()">Flush</button>
    </div>
    <asyncDebouncer.Subscribe
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
        ><template v-if="isExecuting"><p>Executing...</p></template>
      </div></asyncDebouncer.Subscribe
    ><asyncDebouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </asyncDebouncer.Subscribe>
  </div>
</template>
