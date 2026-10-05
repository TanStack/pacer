<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { throttle } from '@tanstack/vue-pacer/throttler'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const throttledCount = ref(0)

// Create throttled setter function - Stable reference required!
const throttledSetCount = throttle(
  (value: typeof throttledCount.value) => (throttledCount.value = value),
  {
    wait: 1000,
  },
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    throttledSetCount(newInstantCount) // throttled state update
    return newInstantCount // instant state update
  })(instantCount.value)
}

const text = ref('')

const throttledText = ref('')

// Create throttled setter function - Stable reference required!
const throttledSetText = throttle(
  (value: typeof throttledText.value) => (throttledText.value = value),
  {
    wait: 1000,
  },
)

function handleTextChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  text.value = newValue
  throttledSetText(newValue)
}

const currentValue = ref(50)

const throttledValue = ref(50)

const instantExecutionCount = ref(0)

// Create throttled setter function - Stable reference required!
const throttledSetValue = throttle(
  (value: typeof throttledValue.value) => (throttledValue.value = value),
  {
    wait: 250,
  },
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  throttledSetValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer throttle Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{{ throttledCount }}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer throttle Example 2</h1>
      <div>
        <input
          type="search"
          :value="text"
          @input="handleTextChange"
          placeholder="Type text (throttled to 1 update per second)..."
          :style="{ width: '100%' }"
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>{{ text }}</td>
          </tr>
          <tr>
            <td>Throttled Text:</td>
            <td>{{ throttledText }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer throttle Example 3</h1>
      <div :style="{ marginBottom: '20px' }">
        <label
          >Current Range:<input
            type="range"
            min="0"
            max="100"
            :value="currentValue"
            @input="handleRangeChange"
            :style="{ width: '100%' }"
          /><span>{{ currentValue }}</span></label
        >
      </div>
      <div :style="{ marginBottom: '20px' }">
        <label
          >Throttled Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            :value="throttledValue"
            disabled
            :style="{ width: '100%' }"
          /><span>{{ throttledValue }}</span></label
        >
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Executions:</td>
            <td>{{ instantExecutionCount }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Throttled with 250ms wait time</p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
