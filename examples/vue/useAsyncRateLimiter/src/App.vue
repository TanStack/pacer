<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref, onUnmounted } from 'vue'
import { useAsyncRateLimiter } from '@tanstack/vue-pacer/async-rate-limiter'
const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface SearchResult {
  id: number
  title: string
}
// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const windowType = ref<'fixed' | 'sliding'>('fixed')

const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

const error = ref<Error | null>(null)

// The function that will become rate limited
const handleSearch = async (term: string) => {
  if (!term) {
    results.value = []
    return
  }
  // throw new Error('Test error') // you don't have to catch errors here (though you still can). The onError optional handler will catch it
  const data = await fakeApi(term)
  results.value = data
  error.value = null
}

const setSearchAsyncRateLimiter = useAsyncRateLimiter(handleSearch, () => ({
  key: 'useAsyncRateLimiter',
  windowType: windowType.value,
  limit: 3, // Maximum 3 requests
  window: 3000, // per 3 seconds
  onReject: (_args, rateLimiter) => {
    console.log(
      `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
    )
  },
  onError: (cause) => {
    // optional error handler
    console.error('Search failed:', cause)
    error.value = cause as Error
    results.value = []
  },
}))

// get and name our rate limited function
const handleSearchRateLimited = setSearchAsyncRateLimiter.maybeExecute

onUnmounted(() => {
  console.log('unmount')
  setSearchAsyncRateLimiter.reset() // cancel any pending async calls when the component unmounts
})

// instant event handler that calls both the instant local state setter and the rate limited function
async function onSearchChange(e: Event) {
  const newTerm = (e.target as HTMLInputElement).value
  searchTerm.value = newTerm
  await handleSearchRateLimited(newTerm) // optionally await if you need to
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useAsyncRateLimiter Example</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
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
    <template v-if="error"
      ><div>Error: {{ error.message }}</div></template
    ><setSearchAsyncRateLimiter.Subscribe
      :selector="
        (state) => ({
          successCount: state.successCount,
          rejectionCount: state.rejectionCount,
          isExecuting: state.isExecuting,
        })
      "
      v-slot="{ successCount, rejectionCount, isExecuting }"
      ><div>
        <table>
          <tbody>
            <tr>
              <td>API calls made:</td>
              <td>{{ successCount }}</td>
            </tr>
            <tr>
              <td>Rejected calls:</td>
              <td>{{ rejectionCount }}</td>
            </tr>
            <tr>
              <td>Is executing:</td>
              <td>{{ isExecuting ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <td>Results:</td>
              <td>
                <template v-if="results.length > 0"
                  ><ul>
                    <template v-for="(item, index) in results" :key="index"
                      ><li>{{ item.title }}</li></template
                    >
                  </ul></template
                ><template v-else>{{ 'No results' }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div></setSearchAsyncRateLimiter.Subscribe
    ><setSearchAsyncRateLimiter.Subscribe
      :selector="(state) => state"
      v-slot="state"
    >
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </setSearchAsyncRateLimiter.Subscribe>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
