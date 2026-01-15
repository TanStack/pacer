<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledCallback } from '@tanstack/vue-pacer/throttler'

const mousePosition = ref({ x: 0, y: 0 })
const throttledPosition = ref({ x: 0, y: 0 })
const callCount = ref(0)

const [throttledMouseMove, throttler] = useThrottledCallback(
  (x: number, y: number) => {
    throttledPosition.value = { x, y }
    callCount.value++
    console.log('Throttled callback executed with:', { x, y })
  },
  { wait: 100 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    status: state.status,
  }),
)

function handleMouseMove(e: MouseEvent) {
  mousePosition.value = { x: e.clientX, y: e.clientY }
  throttledMouseMove(e.clientX, e.clientY)
}
</script>

<template>
  <div
    style="
      padding: 20px;
      font-family: sans-serif;
      min-height: 100vh;
      box-sizing: border-box;
    "
    @mousemove="handleMouseMove"
  >
    <h1>useThrottledCallback Example</h1>

    <div style="margin-bottom: 20px">
      <p>Move your mouse around to see throttling in action.</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Mouse Position</h3>
      <p>
        <strong>Instant Position:</strong> ({{ mousePosition.x }},
        {{ mousePosition.y }})
      </p>
      <p>
        <strong>Throttled Position:</strong> ({{ throttledPosition.x }},
        {{ throttledPosition.y }})
      </p>
      <p><strong>Callback Executions:</strong> {{ callCount }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Throttler State</h3>
      <p><strong>Status:</strong> {{ throttler.state.value.status }}</p>
      <p><strong>Is Pending:</strong> {{ throttler.state.value.isPending }}</p>
      <p>
        <strong>Execution Count:</strong>
        {{ throttler.state.value.executionCount }}
      </p>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        The instant position updates on every mouse move event, while the
        throttled callback only executes at most once every 100ms. This limits
        the rate of expensive operations. Check the console for log output.
      </p>
    </div>
  </div>
</template>
