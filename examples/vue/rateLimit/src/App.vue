<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { computed, ref } from 'vue'
import { rateLimit } from '@tanstack/vue-pacer/rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const rateLimitedCount = ref(0)

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetCount = computed(() =>
  rateLimit(
    (value: typeof rateLimitedCount.value) => (rateLimitedCount.value = value),
    {
      limit: 5,
      window: 5000,
      windowType: counterWindowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function increment() {
  // this pattern helps avoid common bugs with stale closures and state
  instantCount.value = ((c) => {
    const newInstantCount = c + 1 // common new value for both
    rateLimitedSetCount.value(newInstantCount) // rate-limited state update
    return newInstantCount // instant state update
  })(instantCount.value)
}

const searchWindowType = ref<'fixed' | 'sliding'>('fixed')

const text = ref('')

const rateLimitedText = ref('')

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetText = computed(() =>
  rateLimit(
    (value: typeof rateLimitedText.value) => (rateLimitedText.value = value),
    {
      limit: 5,
      window: 5000,
      windowType: searchWindowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function handleTextChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  text.value = newValue
  rateLimitedSetText.value(newValue)
}

const rangeWindowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const rateLimitedValue = ref(50)

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetValue = computed(() =>
  rateLimit(
    (value: typeof rateLimitedValue.value) => (rateLimitedValue.value = value),
    {
      limit: 30,
      window: 2000,
      windowType: rangeWindowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  rateLimitedSetValue.value(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer rateLimit Example 1</h1>
      <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
        <label
          ><input
            type="radio"
            name="counterWindowType"
            value="fixed"
            :checked="counterWindowType === 'fixed'"
            @input="() => (counterWindowType = 'fixed')"
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="counterWindowType"
            value="sliding"
            :checked="counterWindowType === 'sliding'"
            @input="() => (counterWindowType = 'sliding')"
          />Sliding Window</label
        >
      </div>
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
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer rateLimit Example 2</h1>
      <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
        <label
          ><input
            type="radio"
            name="windowType2"
            value="fixed"
            :checked="searchWindowType === 'fixed'"
            @input="() => (searchWindowType = 'fixed')"
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType2"
            value="sliding"
            :checked="searchWindowType === 'sliding'"
            @input="() => (searchWindowType = 'sliding')"
          />Sliding Window</label
        >
      </div>
      <div>
        <input
          type="search"
          :value="text"
          @input="handleTextChange"
          placeholder="Type text (rate limited to 5 updates per 5 seconds)..."
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
            <td>Rate Limited Text:</td>
            <td>{{ rateLimitedText }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer rateLimit Example 3</h1>
      <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
        <label
          ><input
            type="radio"
            name="windowType3"
            value="fixed"
            :checked="rangeWindowType === 'fixed'"
            @input="() => (rangeWindowType = 'fixed')"
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType3"
            value="sliding"
            :checked="rangeWindowType === 'sliding'"
            @input="() => (rangeWindowType = 'sliding')"
          />Sliding Window</label
        >
      </div>
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
          >Rate Limited Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            :value="rateLimitedValue"
            disabled
            :style="{ width: '100%' }"
          /><span>{{ rateLimitedValue }}</span></label
        >
      </div>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Rate limited to 30 updates per 2000ms window</p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
