<script setup lang="ts">
import { ref } from 'vue'
import { useThrottler } from '@tanstack/vue-pacer/throttler'

// Range slider example - throttle to 250ms
const instantSliderValue = ref(50)
const throttledSliderValue = ref(50)
const sliderInstantCount = ref(0)

const sliderThrottler = useThrottler(
  (value: number) => {
    throttledSliderValue.value = value
  },
  { wait: 250 },
  (state) => ({
    executionCount: state.executionCount,
    isPending: state.isPending,
  }),
)

function handleSliderChange(e: Event) {
  const target = e.target as HTMLInputElement
  const value = Number(target.value)
  instantSliderValue.value = value
  sliderInstantCount.value++
  sliderThrottler.maybeExecute(value)
}

// Counter button example - throttle to 500ms
const instantClickCount = ref(0)
const throttledClickCount = ref(0)

const clickThrottler = useThrottler(
  () => {
    throttledClickCount.value++
  },
  { wait: 500 },
  (state) => ({
    executionCount: state.executionCount,
    isPending: state.isPending,
  }),
)

function handleClick() {
  instantClickCount.value++
  clickThrottler.maybeExecute()
}

// Mouse move example
const instantMousePosition = ref({ x: 0, y: 0 })
const throttledMousePosition = ref({ x: 0, y: 0 })
const mouseMoveInstantCount = ref(0)

const mouseMoveThrottler = useThrottler(
  (x: number, y: number) => {
    throttledMousePosition.value = { x, y }
  },
  { wait: 100 },
  (state) => ({
    executionCount: state.executionCount,
    isPending: state.isPending,
  }),
)

function handleMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = Math.round(e.clientX - rect.left)
  const y = Math.round(e.clientY - rect.top)
  instantMousePosition.value = { x, y }
  mouseMoveInstantCount.value++
  mouseMoveThrottler.maybeExecute(x, y)
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useThrottler Example</h1>

    <!-- Range Slider Example -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Range Slider (250ms throttle)</h2>
      <input
        type="range"
        min="0"
        max="100"
        :value="instantSliderValue"
        @input="handleSliderChange"
        style="width: 300px"
      />
      <div style="margin-top: 10px">
        <p><strong>Instant Value:</strong> {{ instantSliderValue }}</p>
        <p><strong>Throttled Value:</strong> {{ throttledSliderValue }}</p>
        <p>
          <strong>Instant Updates:</strong> {{ sliderInstantCount }} |
          <strong>Throttled Executions:</strong>
          {{ sliderThrottler.state.value.executionCount }}
        </p>
        <p>
          <strong>Reduction:</strong>
          {{
            sliderInstantCount > 0
              ? Math.round(
                  (1 -
                    sliderThrottler.state.value.executionCount /
                      sliderInstantCount) *
                    100,
                )
              : 0
          }}%
        </p>
      </div>
    </div>

    <!-- Counter Button Example -->
    <div
      style="
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      "
    >
      <h2>Counter Button (500ms throttle)</h2>
      <button
        @click="handleClick"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer"
      >
        Click me fast!
      </button>
      <div style="margin-top: 10px">
        <p><strong>Instant Click Count:</strong> {{ instantClickCount }}</p>
        <p><strong>Throttled Click Count:</strong> {{ throttledClickCount }}</p>
        <p>
          <strong>Reduction:</strong>
          {{
            instantClickCount > 0
              ? Math.round((1 - throttledClickCount / instantClickCount) * 100)
              : 0
          }}%
        </p>
        <p>
          <strong>Is Pending:</strong>
          {{ clickThrottler.state.value.isPending }}
        </p>
      </div>
    </div>

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
        "
      >
        Move your mouse here
      </div>
      <div style="margin-top: 10px">
        <p>
          <strong>Instant Position:</strong> ({{ instantMousePosition.x }},
          {{ instantMousePosition.y }})
        </p>
        <p>
          <strong>Throttled Position:</strong> ({{ throttledMousePosition.x }},
          {{ throttledMousePosition.y }})
        </p>
        <p>
          <strong>Instant Updates:</strong> {{ mouseMoveInstantCount }} |
          <strong>Throttled Executions:</strong>
          {{ mouseMoveThrottler.state.value.executionCount }}
        </p>
        <p>
          <strong>Reduction:</strong>
          {{
            mouseMoveInstantCount > 0
              ? Math.round(
                  (1 -
                    mouseMoveThrottler.state.value.executionCount /
                      mouseMoveInstantCount) *
                    100,
                )
              : 0
          }}%
        </p>
      </div>
    </div>

    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px">
      <h3>How it works</h3>
      <p>
        Throttling ensures a function executes at most once per interval,
        regardless of how many times it's called. Unlike debouncing, which waits
        for a pause in calls, throttling provides regular execution at a fixed
        rate.
      </p>
      <p>
        The "Reduction" percentage shows how many function calls were saved by
        throttling compared to executing on every event.
      </p>
    </div>
  </div>
</template>
