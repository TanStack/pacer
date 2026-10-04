<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { fetchPost } from './api'

  let { postId }: { postId: number } = $props()
  const post = createQuery(() => ({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  }))
</script>

{#if post.isLoading}
  <div>Loading post...</div>
{:else}
  <div>
    <h3>{post.data?.title}</h3>
    <p>{post.data?.body}</p>
  </div>
{/if}
