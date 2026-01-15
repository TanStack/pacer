<script setup lang="ts">
import { ref, computed } from 'vue'
import { throttle } from '@tanstack/vue-pacer'

// Mouse position tracking with throttled updates
const instantPosition = ref({ x: 0, y: 0 })
const throttledPosition = ref({ x: 0, y: 0 })
const instantCount = ref(0)
const throttledCount = ref(0)

// Create a throttled function that updates position at most once per 100ms
const updateThrottledPosition = throttle(
  (x: number, y: number) => {
    throttledPosition.value = { x, y }
    throttledCount.value++
  },
  { wait: 100 },
)

function handleMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = Math.round(e.clientX - rect.left)
  const y = Math.round(e.clientY - rect.top)

  // Update instant position on every event
  instantPosition.value = { x, y }
  instantCount.value++

  // Throttled update - at most once per 100ms
  updateThrottledPosition(x, y)
}

// Scroll tracking example
const instantScrollY = ref(0)
const throttledScrollY = ref(0)
const scrollInstantCount = ref(0)
const scrollThrottledCount = ref(0)

const updateThrottledScroll = throttle(
  (scrollTop: number) => {
    throttledScrollY.value = scrollTop
    scrollThrottledCount.value++
  },
  { wait: 150 },
)

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  const scrollTop = Math.round(target.scrollTop)

  instantScrollY.value = scrollTop
  scrollInstantCount.value++

  updateThrottledScroll(scrollTop)
}

// Computed reduction percentages
const mouseReduction = computed(() => {
  if (instantCount.value === 0) return 0
  return Math.round((1 - throttledCount.value / instantCount.value) * 100)
})

const scrollReduction = computed(() => {
  if (scrollInstantCount.value === 0) return 0
  return Math.round(
    (1 - scrollThrottledCount.value / scrollInstantCount.value) * 100,
  )
})
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>throttle Example</h1>
    <p style="color: #666; margin-bottom: 20px">
      The standalone <code>throttle</code> function creates a throttled version
      of any function. Unlike the <code>useThrottler</code> composable, this is
      a simple utility that returns the throttled function directly.
    </p>

    <!-- Mouse Move Example -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Mouse Move Tracking (100ms throttle)</h2>
      <div
        @mousemove="handleMouseMove"
        style="
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          cursor: crosshair;
          user-select: none;
        "
      >
        Move your mouse here
      </div>
      <div style="margin-top: 15px; display: grid; gap: 8px">
        <div style="display: flex; gap: 40px">
          <div>
            <strong>Instant Position:</strong>
            <span style="font-family: monospace">
              ({{ instantPosition.x }}, {{ instantPosition.y }})
            </span>
          </div>
          <div>
            <strong>Throttled Position:</strong>
            <span style="font-family: monospace">
              ({{ throttledPosition.x }}, {{ throttledPosition.y }})
            </span>
          </div>
        </div>
        <div style="display: flex; gap: 40px">
          <div>
            <strong>Instant Updates:</strong>
            {{ instantCount }}
          </div>
          <div>
            <strong>Throttled Updates:</strong>
            {{ throttledCount }}
          </div>
          <div>
            <strong>Reduction:</strong>
            <span style="color: #22c55e; font-weight: bold">
              {{ mouseReduction }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Tracking Example -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Scroll Tracking (150ms throttle)</h2>
      <div
        @scroll="handleScroll"
        style="
          width: 100%;
          height: 200px;
          overflow-y: scroll;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 20px;
        "
      >
        <div style="height: 800px; padding: 10px">
          <p style="position: sticky; top: 0; background: #fff; padding: 10px">
            Scroll inside this container to see throttling in action
          </p>
          <div
            v-for="i in 20"
            :key="i"
            style="padding: 15px; margin: 10px 0; background: #e0e0e0"
          >
            Section {{ i }}
          </div>
        </div>
      </div>
      <div style="margin-top: 15px; display: grid; gap: 8px">
        <div style="display: flex; gap: 40px">
          <div>
            <strong>Instant Scroll Y:</strong>
            <span style="font-family: monospace">{{ instantScrollY }}px</span>
          </div>
          <div>
            <strong>Throttled Scroll Y:</strong>
            <span style="font-family: monospace">{{ throttledScrollY }}px</span>
          </div>
        </div>
        <div style="display: flex; gap: 40px">
          <div>
            <strong>Instant Updates:</strong>
            {{ scrollInstantCount }}
          </div>
          <div>
            <strong>Throttled Updates:</strong>
            {{ scrollThrottledCount }}
          </div>
          <div>
            <strong>Reduction:</strong>
            <span style="color: #22c55e; font-weight: bold">
              {{ scrollReduction }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px">
      <h3>How throttle Works</h3>
      <p>
        The <code>throttle</code> function wraps any function to ensure it
        executes at most once per specified interval. This is useful for
        high-frequency events like mouse moves or scroll where you want regular
        updates but not on every single event.
      </p>
      <pre
        style="
          background: #1a1a2e;
          color: #eee;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        "
      >
const throttledFn = throttle(fn, { wait: 100 })

// Options:
// - wait: Time in ms between allowed executions
// - leading: Execute on first call (default: true)
// - trailing: Execute after interval if called during wait (default: true)</pre
      >
    </div>
  </div>
</template>
