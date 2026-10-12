<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  noop,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { VueQueryDevtoolsPanel } from '@tanstack/vue-query-devtools'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { useDebouncer } from '@tanstack/vue-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'

interface Post {
  id: number
  title: string
  body: string
}

async function fetchJson<TData>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  // fetch only rejects on network errors, so turn 4xx/5xx into query errors
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json() as Promise<TData>
}

const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: ({ signal }) =>
    fetchJson<Array<Post>>(
      'https://jsonplaceholder.typicode.com/posts',
      signal,
    ),
})

// Share one options object between the prefetch and `useQuery` so the key and
// fetcher can never drift apart
const postQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ['post', postId],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a slow response
      return fetchJson<Post>(
        `https://jsonplaceholder.typicode.com/posts/${postId}`,
        signal,
      )
    },
  })

const queryClient = useQueryClient()
const selectedPostId = ref<number | null>(null)

const posts = useQuery(postsQueryOptions)

// Debounce the prefetch itself rather than a hovered-id ref. Only the post the
// pointer rests on is prefetched.
const prefetcher = useDebouncer(
  (postId: number) => {
    // `query` fetches only when the cached post is missing or stale. A failed
    // prefetch is ignored here; the post detail will retry and show the error.
    queryClient.query(postQueryOptions(postId)).catch(noop)
  },
  {
    key: 'Post Prefetch Debouncer', // identifies this debouncer in the Pacer devtools
    wait: 100, // adjust this value to see the difference
  },
)

const post = useQuery(
  computed(() => ({
    ...postQueryOptions(selectedPostId.value ?? 0),
    enabled: selectedPostId.value !== null,
  })),
)

const dev = import.meta.env.DEV
// Open the Pacer and Query panels as tabs to watch prefetches land
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
    <h1>TanStack Pacer/Query Debounced Prefetch Example</h1>
    <p>Hover over a post title to prefetch its content</p>
    <p>
      The prefetch is debounced, so it only runs once the pointer rests on a
      post for 100ms. Sweeping across the list prefetches nothing until you
      stop, and leaving the list cancels the pending prefetch.
    </p>
    <p>
      Prefetched posts stay fresh for 10 seconds. Hovering a post after that
      refreshes it in the background.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <div v-if="posts.isPending.value">Loading posts...</div>
      <div v-else-if="posts.isError.value">Could not load posts.</div>
      <div v-else>
        <h2>Posts</h2>
        <!-- Leaving the list before the debounce settles cancels the prefetch -->
        <ul style="margin: 0; padding: 0" @mouseleave="prefetcher.cancel()">
          <li
            v-for="item in posts.data.value"
            :key="item.id"
            style="margin: 2px 0"
          >
            <a
              :href="`#post-${item.id}`"
              @mouseenter="prefetcher.maybeExecute(item.id)"
              @click="selectedPostId = item.id"
              style="display: block; padding: 4px; cursor: pointer"
              >{{ item.title }}</a
            >
          </li>
        </ul>
      </div>
      <template v-if="selectedPostId !== null">
        <div v-if="post.isPending.value">Loading post...</div>
        <div v-else-if="post.isError.value">Could not load post.</div>
        <div v-else>
          <h3>{{ post.data.value?.title }}</h3>
          <p>{{ post.data.value?.body }}</p>
        </div>
      </template>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
