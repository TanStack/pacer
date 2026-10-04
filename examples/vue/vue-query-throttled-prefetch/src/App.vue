<script setup lang="ts">
import { ref } from 'vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import PostList from './PostList.vue'
import PostDetail from './PostDetail.vue'

const dev = import.meta.env.DEV
const selectedPostId = ref<number | null>(null)
</script>

<template>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Throttled Prefetch Example</h1>
    <p>Hover over a post title to prefetch its content</p>
    <p>
      This example shows how to prefetch a query when the user hovers over a
      post.
    </p>
    <p>
      The throttled query key is created after a throttle to avoid excessive
      prefetches.
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <PostList @select="selectedPostId = $event" />
      <PostDetail v-if="selectedPostId" :post-id="selectedPostId" />
    </div>
  </div>
  <VueQueryDevtools v-if="dev" :initial-is-open="false" />
</template>
