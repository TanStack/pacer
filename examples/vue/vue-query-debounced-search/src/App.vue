<script setup lang="ts">
import { computed, ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { VueQueryDevtoolsPanel } from '@tanstack/vue-query-devtools'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { useDebouncedValue } from '@tanstack/vue-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'

interface Post {
  id: number
  title: string
}

const posts: Array<Post> = [
  'Getting started with TanStack Query',
  'Debouncing user input',
  'Throttling scroll handlers',
  'Rate limiting API calls',
  'Queueing background work',
  'Batching writes to the server',
  'Prefetching data on hover',
  'Caching search results',
  'Cancelling stale requests',
  'Optimistic updates with mutations',
  'Retrying failed queries',
  'Keeping previous data while fetching',
].map((title, index) => ({ id: index + 1, title }))

// A fake search API with a slow response that can be cancelled
function searchPosts(term: string, signal: AbortSignal) {
  return new Promise<Array<Post>>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve(
        posts.filter((post) =>
          post.title.toLowerCase().includes(term.toLowerCase()),
        ),
      )
    }, 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timeout)
      reject(signal.reason)
    })
  })
}

const search = ref('')
const requests = ref({ sent: 0, cancelled: 0 })

// Debounce the search term, not the query function. Each debounced term
// becomes its own query key, so Query caches every term separately.
const [debouncedSearch] = useDebouncedValue(search, {
  key: 'Post Search Debouncer', // identifies this debouncer in the Pacer devtools
  wait: 300, // adjust this value to see the difference
})
const term = computed(() => debouncedSearch.value.trim())

const searchQuery = useQuery(
  computed(() => ({
    queryKey: ['posts', 'search', term.value],
    queryFn: ({ signal }: { signal: AbortSignal }) => {
      requests.value.sent++
      // Query aborts the signal when a newer term replaces this one
      signal.addEventListener('abort', () => requests.value.cancelled++)
      return searchPosts(term.value, signal)
    },
    enabled: term.value.length > 0,
    // Keep showing the last results while the next term loads
    placeholderData: keepPreviousData,
  })),
)

const status = computed(() =>
  search.value !== debouncedSearch.value
    ? 'Typing...'
    : searchQuery.isFetching.value
      ? 'Searching...'
      : !term.value
        ? 'Type to search'
        : searchQuery.isError.value
          ? 'Search failed'
          : `Matches for "${term.value}": ${searchQuery.data.value?.length ?? 0}`,
)

const dev = import.meta.env.DEV
// Open the Pacer and Query panels as tabs to watch searches run
const plugins = [
  { ...pacerDevtoolsPlugin(), defaultOpen: true },
  {
    name: 'TanStack Query',
    component: VueQueryDevtoolsPanel,
    defaultOpen: true,
  },
]
</script>

<template>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Debounced Search Example</h1>
    <p>
      The search term is debounced, so a query only runs once you stop typing
      for 300ms. While the next results load, the previous results stay on
      screen.
    </p>
    <p>
      When a newer term replaces a search that is still running, Query cancels
      the older request through its abort signal.
    </p>
    <label style="display: block; margin-bottom: 8px">
      Search posts
      <input v-model="search" placeholder="Try 'query' or 'data'" />
    </label>
    <p>{{ status }}</p>
    <ul :style="{ opacity: searchQuery.isPlaceholderData.value ? 0.5 : 1 }">
      <template v-if="term">
        <li v-for="post in searchQuery.data.value" :key="post.id">
          {{ post.title }}
        </li>
      </template>
    </ul>
    <p>
      Requests sent: {{ requests.sent }} | Cancelled: {{ requests.cancelled }}
    </p>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
