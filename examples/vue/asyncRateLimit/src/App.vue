<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { computed, ref } from 'vue'
import { asyncRateLimit } from '@tanstack/vue-pacer/async-rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const windowType = ref<'fixed' | 'sliding'>('fixed')

const searchText = ref('')

const rateLimitedSearchText = ref('')

const searchResults = ref<Array<string>>([])

const loading = ref(false)

// Simulate search API
const simulateSearch = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return [
    `Result 1 for ${query}`,
    `Result 2 for ${query}`,
    `Result 3 for ${query}`,
  ]
}

const rateLimitedSetSearch = computed(() =>
  asyncRateLimit(
    async (value: string) => {
      try {
        loading.value = true
        rateLimitedSearchText.value = value
        const results = await simulateSearch(value)
        searchResults.value = results
      } catch (err) {
        searchResults.value = []
      } finally {
        loading.value = false
      }
    },
    {
      limit: 5,
      window: 5000,
      windowType: windowType.value,
      onReject: (_args, rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    },
  ),
)
</script>

<template>
  <div>
    <h1>TanStack Pacer asyncRateLimit Example</h1>
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
        type="search"
        :value="searchText"
        @input="
          (e) => {
            const newValue = (e.target as HTMLInputElement).value
            searchText = newValue
            rateLimitedSetSearch(newValue)
          }
        "
        placeholder="Type to search..."
        :style="{ width: '100%' }"
      /><template v-if="loading"><div>Loading...</div></template>
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Search:</td>
          <td>{{ searchText }}</td>
        </tr>
        <tr>
          <td>Rate Limited Search:</td>
          <td>{{ rateLimitedSearchText }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <h3>Search Results:</h3>
      <ul>
        <template v-for="(result, i) in searchResults" :key="i"
          ><li>{{ result }}</li></template
        >
      </ul>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
