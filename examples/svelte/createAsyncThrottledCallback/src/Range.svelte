<script lang="ts">
  import { createAsyncThrottledCallback } from '@tanstack/svelte-pacer/async-throttler'
  let scrollPosition = $state(0)

  let saveCount = $state(0)

  let lastSaved = $state<Date | null>(null)

  let isSaving = $state(false)

  // Simulate saving scroll position to server
  const saveScrollPosition = async (
    position: number,
  ): Promise<{
    success: boolean
    position: number
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true, position }
  }

  const throttledSave = createAsyncThrottledCallback(
    async (position: number) => {
      isSaving = true
      try {
        const result = await saveScrollPosition(position)
        saveCount = saveCount + 1
        lastSaved = new Date()
        return result
      } finally {
        isSaving = false
      }
    },
    () => ({
      wait: 1000,
      leading: true,
      trailing: true,
    }),
  )

  function handleScroll(e: Event) {
    const position = (e.currentTarget as HTMLInputElement).scrollTop
    scrollPosition = position
    throttledSave(position)
  }
</script>

<div>
  <h1>TanStack Pacer createAsyncThrottledCallback Example 3</h1>
  <div
    style="height: 200px; overflow: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px"
    onscroll={handleScroll}
  >
    <div style="height: 1000px">
      <p>Scroll this area to trigger throttled saves!</p>
      <p>Current scroll position: {Math.round(scrollPosition)}px</p>
      {#if isSaving}<p style="color: blue">Saving position...</p>{/if}
      <div style="margin-top: 20px">
        <p>Saves triggered: {saveCount}</p>
        {#if lastSaved}<p>
            Last saved at: {lastSaved.toLocaleTimeString()}
          </p>{/if}
      </div>
      <div style="margin-top: 40px">
        <p>Keep scrolling...</p>
        <p style="margin-top: 100px">More content...</p>
        <p style="margin-top: 100px">Even more content...</p>
        <p style="margin-top: 100px">Almost there...</p>
        <p style="margin-top: 100px">You made it to the end!</p>
      </div>
    </div>
  </div>
  <p style="font-size: 0.9em; color: #666">
    Scroll position is saved at most once per second, but updates instantly on
    screen
  </p>
</div>
