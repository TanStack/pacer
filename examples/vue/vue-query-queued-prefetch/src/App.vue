<script setup lang="ts">
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { ref, watch, computed } from 'vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { useQueuedValue } from '@tanstack/vue-pacer'

interface Post {
  id: number
  title: string
  body: string
}

const queryClient = useQueryClient()

async function fetchPosts(): Promise<Array<Post>> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return response.json()
}

async function fetchPost(id: number): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate a slow response.
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  )
  return response.json()
}

const dev = import.meta.env.DEV
const selectedPostId = ref<number | null>(null)

const { data: posts, isLoading: isPostsLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})
const currentHoveredPostId = ref<number | null>(null)
const [scheduledHoveredPostId] = useQueuedValue(
  () => currentHoveredPostId.value,
  {
    addItemsTo: 'front', // Newest hovered link is top priority.
    wait: 100,
    expirationDuration: 500, // Drop links that have waited too long to be prefetched.
    onExpire: (item) => console.log('expired', item),
  },
)

// Prefetch when Pacer commits the hovered post id.
watch(scheduledHoveredPostId, (id) => {
  if (id)
    void queryClient.ensureQueryData({
      queryKey: ['post', id],
      queryFn: () => fetchPost(id),
    })
})

const { data: post, isLoading: isPostLoading } = useQuery(
  computed(() => ({
    queryKey: ['post', selectedPostId.value],
    enabled: selectedPostId.value !== null,
    queryFn: () => fetchPost(selectedPostId.value!),
  })),
)
</script>

<template>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Queued Prefetch Example</h1>
    <p>Hover over a post title to queue up its prefetch</p>
    <p>
      This example shows how to queue up prefetch requests when the user hovers
      over a post, processing them in order with a delay between each.
    </p>
    <p>
      The queued query key is processed after a delay to avoid overwhelming the
      server with too many requests at once.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <div v-if="isPostsLoading">Loading posts...</div>
      <div v-else>
        <h2>Posts</h2>
        <ul style="margin: 0; padding: 0">
          <li v-for="post in posts" :key="post.id" style="margin: 2px 0">
            <a
              :href="`#post-${post.id}`"
              @mouseenter="currentHoveredPostId = post.id"
              @click="selectedPostId = post.id"
              style="display: block; padding: 4px; cursor: pointer"
              >{{ post.title }}</a
            >
          </li>
        </ul>
      </div>
      <template v-if="selectedPostId"
        ><div v-if="isPostLoading">Loading post...</div>
        <div v-else>
          <h3>{{ post?.title }}</h3>
          <p>{{ post?.body }}</p>
        </div></template
      >
    </div>
  </div>
  <VueQueryDevtools v-if="dev" :initial-is-open="false" />
</template>
