<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDebouncedValue } from '@tanstack/vue-pacer'
import { fetchPosts, fetchPost, queryClient } from './api'

const emit = defineEmits<{ select: [id: number] }>()
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})
const currentHoveredPostId = ref<number | null>(null)
const [scheduledHoveredPostId] = useDebouncedValue(
  () => currentHoveredPostId.value,
  {
    wait: 100,
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
</script>

<template>
  <div v-if="isLoading">Loading posts...</div>
  <div v-else>
    <h2>Posts</h2>
    <ul style="margin: 0; padding: 0">
      <li v-for="post in posts" :key="post.id" style="margin: 2px 0">
        <a
          :href="`#post-${post.id}`"
          @mouseenter="currentHoveredPostId = post.id"
          @click="emit('select', post.id)"
          style="display: block; padding: 4px; cursor: pointer"
          >{{ post.title }}</a
        >
      </li>
    </ul>
  </div>
</template>
