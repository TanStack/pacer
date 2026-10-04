<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchPost } from './api'

const props = defineProps<{ postId: number }>()
const { data: post, isLoading } = useQuery(
  computed(() => ({
    queryKey: ['post', props.postId],
    queryFn: () => fetchPost(props.postId),
  })),
)
</script>

<template>
  <div v-if="isLoading">Loading post...</div>
  <div v-else>
    <h3>{{ post?.title }}</h3>
    <p>{{ post?.body }}</p>
  </div>
</template>
