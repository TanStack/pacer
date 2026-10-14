<script setup lang="ts">
import { computed, ref } from 'vue'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/vue-query'
import { VueQueryDevtoolsPanel } from '@tanstack/vue-query-devtools'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { useAsyncQueuer } from '@tanstack/vue-pacer'
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
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response
      return fetchJson<Post>(
        `https://jsonplaceholder.typicode.com/posts/${postId}`,
        signal,
      )
    },
  })

const queryClient = useQueryClient()
const selectedPostId = ref<number | null>(null)

const posts = useQuery(postsQueryOptions)

// Each hovered post is queued, and the queue runs at most 2 prefetches at a
// time so a fast sweep across the list can't flood the server.
const prefetchQueuer = useAsyncQueuer(
  // `query` fetches only when the cached post is missing or stale, so cached
  // posts leave the queue immediately. The queuer catches a failed prefetch;
  // the post detail will retry and show the error.
  (postId: number) => queryClient.query(postQueryOptions(postId)),
  {
    key: 'Post Prefetch Queue', // identifies this queuer in the Pacer devtools
    concurrency: 2, // at most 2 prefetches in flight
    addItemsTo: 'front', // newest hovered post is top priority
    expirationDuration: 1000, // drop posts still waiting 1s after they were hovered
    onExpire: (postId) => {
      console.log('expired', postId)
    },
  },
)

function handleMouseEnter(postId: number) {
  // skip posts that are already waiting or being prefetched
  if (prefetchQueuer.peekAllItems().includes(postId)) return
  prefetchQueuer.addItem(postId)
}

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
    <h1>TanStack Pacer/Query Queued Prefetch Example</h1>
    <p>Hover over a post title to queue up its prefetch</p>
    <p>
      Every hovered post joins a queue that runs at most 2 prefetches at once,
      so sweeping across the list never floods the server. The most recently
      hovered post goes first, and posts still waiting after 1 second are
      dropped because you have probably moved on.
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
        <!-- Only this line updates when the queue changes -->
        <prefetchQueuer.Subscribe
          :selector="
            (state) => ({
              prefetching: state.activeItems,
              queued: state.items,
            })
          "
          v-slot="{ prefetching, queued }"
        >
          <p>
            Prefetching: {{ prefetching.join(', ') || 'none' }} | Queued:
            {{ queued.join(', ') || 'none' }}
          </p>
        </prefetchQueuer.Subscribe>
        <ul style="margin: 0; padding: 0">
          <li
            v-for="item in posts.data.value"
            :key="item.id"
            style="margin: 2px 0"
          >
            <a
              :href="`#post-${item.id}`"
              @mouseenter="handleMouseEnter(item.id)"
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
