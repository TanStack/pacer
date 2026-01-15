<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRateLimitedValue } from '@tanstack/vue-pacer/rate-limiter'

// Example 1: Counter with rate limiting
const instantCount = ref(0)
const [rateLimitedCount] = useRateLimitedValue(instantCount, {
  limit: 5,
  window: 5000,
})

function increment() {
  instantCount.value++
}

// Example 2: Search input with rate limiting
const instantSearch = ref('')
const [rateLimitedSearch] = useRateLimitedValue(instantSearch, {
  limit: 5,
  window: 5000,
  enabled: () => instantSearch.value.length > 2,
})

// Example 3: Range slider with rate limiter state
const currentValue = ref(50)
const instantExecutionCount = ref(0)

const [rateLimitedValue, rateLimiter] = useRateLimitedValue(currentValue, {
  limit: 5,
  window: 5000,
})

const rateLimiterState = rateLimiter.state

const savedExecutions = computed(
  () => instantExecutionCount.value - rateLimiterState.value.executionCount,
)

const reductionPercent = computed(() =>
  instantExecutionCount.value === 0
    ? 0
    : Math.round((savedExecutions.value / instantExecutionCount.value) * 100),
)

function handleRangeChange(e: Event) {
  const target = e.target as HTMLInputElement
  currentValue.value = parseInt(target.value, 10)
  instantExecutionCount.value++
}
</script>

<template>
  <div>
    <h1>TanStack Pacer useRateLimitedValue Example 1</h1>
    <table>
      <tbody>
        <tr>
          <td>Instant Count:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>Rate Limited Count:</td>
          <td>{{ rateLimitedCount }}</td>
        </tr>
      </tbody>
    </table>
    <div>
      <button @click="increment">Increment</button>
    </div>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 5 updates per 5 seconds</p>
    </div>
  </div>

  <hr />

  <div>
    <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
    <div>
      <input
        v-model="instantSearch"
        autofocus
        type="search"
        placeholder="Type to search (min 3 chars)..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Search:</td>
          <td>{{ instantSearch }}</td>
        </tr>
        <tr>
          <td>Rate Limited Search:</td>
          <td>{{ rateLimitedSearch }}</td>
        </tr>
      </tbody>
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 5 updates per 5 seconds (min 3 chars to enable)</p>
    </div>
  </div>

  <hr />

  <div>
    <h1>TanStack Pacer useRateLimitedValue Example 3</h1>
    <div style="margin-bottom: 20px">
      <label>
        Current Range:
        <input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          style="width: 100%"
        />
        <span>{{ currentValue }}</span>
      </label>
    </div>
    <div style="margin-bottom: 20px">
      <label>
        Rate Limited Range (Readonly):
        <input
          type="range"
          min="0"
          max="100"
          :value="rateLimitedValue"
          readonly
          style="width: 100%"
        />
        <span>{{ rateLimitedValue }}</span>
      </label>
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Executions:</td>
          <td>{{ instantExecutionCount }}</td>
        </tr>
        <tr>
          <td>Rate Limited Executions:</td>
          <td>{{ rateLimiterState.executionCount }}</td>
        </tr>
        <tr>
          <td>Saved Executions:</td>
          <td>{{ savedExecutions }}</td>
        </tr>
        <tr>
          <td>% Reduction:</td>
          <td>{{ reductionPercent }}%</td>
        </tr>
      </tbody>
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 5 updates per 5 seconds</p>
    </div>
    <pre style="margin-top: 20px">{{
      JSON.stringify(rateLimiterState, null, 2)
    }}</pre>
  </div>
</template>
