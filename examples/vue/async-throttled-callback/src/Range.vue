<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncThrottler } from '@tanstack/vue-pacer/async-throttler'
const scrollPosition = ref(0)

const saveCount = ref(0)

const lastSaved = ref<Date | null>(null)

const isSaving = ref(false)

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

const throttledSave = useAsyncThrottler(
  async (position: number) => {
    isSaving.value = true
    try {
      const result = await saveScrollPosition(position)
      saveCount.value = saveCount.value + 1
      lastSaved.value = new Date()
      return result
    } finally {
      isSaving.value = false
    }
  },
  () => ({
    wait: 1000,
    leading: true,
    trailing: true,
  }),
).maybeExecute

function handleScroll(e: Event) {
  const position = (e.currentTarget as HTMLInputElement).scrollTop
  scrollPosition.value = position
  throttledSave(position)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useAsyncThrottler Example 3</h1>
    <div
      :style="{
        height: '200px',
        overflow: 'auto',
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '20px',
      }"
      @scroll="handleScroll"
    >
      <div :style="{ height: '1000px' }">
        <p>Scroll this area to trigger throttled saves!</p>
        <p>Current scroll position: {{ Math.round(scrollPosition) }}px</p>
        <template v-if="isSaving"
          ><p :style="{ color: 'blue' }">Saving position...</p></template
        >
        <div :style="{ marginTop: '20px' }">
          <p>Saves triggered: {{ saveCount }}</p>
          <template v-if="lastSaved"
            ><p>
              Last saved at: {{ lastSaved.toLocaleTimeString() }}
            </p></template
          >
        </div>
        <div :style="{ marginTop: '40px' }">
          <p>Keep scrolling...</p>
          <p :style="{ marginTop: '100px' }">More content...</p>
          <p :style="{ marginTop: '100px' }">Even more content...</p>
          <p :style="{ marginTop: '100px' }">Almost there...</p>
          <p :style="{ marginTop: '100px' }">You made it to the end!</p>
        </div>
      </div>
    </div>
    <p :style="{ fontSize: '0.9em', color: '#666' }">
      Scroll position is saved at most once per second, but updates instantly on
      screen
    </p>
  </div>
</template>
