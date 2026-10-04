<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { createThrottledValue } from '@tanstack/svelte-pacer'
  import { fetchPosts, fetchPost, queryClient } from './api'

  let { onSelect }: { onSelect: (id: number) => void } = $props()
  const posts = createQuery(() => ({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  }))
  let currentHoveredPostId = $state<number | null>(null)
  const [scheduledHoveredPostId] = createThrottledValue(
    () => currentHoveredPostId,
    {
      wait: 100,
    },
  )

  // Prefetch when Pacer commits the hovered post id.
  $effect(() => {
    const id = scheduledHoveredPostId()
    if (id)
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
  })
</script>

{#if posts.isLoading}
  <div>Loading posts...</div>
{:else}
  <div>
    <h2>Posts</h2>
    <ul style="margin: 0; padding: 0">
      {#each posts.data ?? [] as post (post.id)}
        <li style="margin: 2px 0">
          <a
            href={`#post-${post.id}`}
            onmouseenter={() => (currentHoveredPostId = post.id)}
            onclick={() => onSelect(post.id)}
            style="display: block; padding: 4px; cursor: pointer"
            >{post.title}</a
          >
        </li>
      {/each}
    </ul>
  </div>
{/if}
