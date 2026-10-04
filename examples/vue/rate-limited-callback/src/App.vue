<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useRateLimiter } from '@tanstack/vue-pacer/rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const instantCountRef = ref(0)

const rateLimitedCount = ref(0)

const rateLimitedSetCount = useRateLimiter(
  (value: typeof rateLimitedCount.value) => {
    rateLimitedCount.value = value
  },
  () => ({
    limit: 5,
    window: 5000,
    windowType: counterWindowType.value,
    enabled: () => instantCountRef.value > 2,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
).maybeExecute

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  rateLimitedSetCount(nextCount)
}

const searchWindowType = ref<'fixed' | 'sliding'>('fixed')

const searchText = ref('')

const searchTextRef = ref('')

const rateLimitedSearchText = ref('')

const rateLimitedSetSearch = useRateLimiter(
  (value: typeof rateLimitedSearchText.value) => {
    rateLimitedSearchText.value = value
  },
  () => ({
    limit: 5,
    window: 5000,
    windowType: searchWindowType.value,
    enabled: () => searchTextRef.value.length > 2,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
).maybeExecute

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  rateLimitedSetSearch(newValue)
}

const rangeWindowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const limitedValue = ref(50)

const rateLimitedSetValue = useRateLimiter(
  (value: typeof limitedValue.value) => {
    limitedValue.value = value
  },
  () => ({
    limit: 20,
    window: 2000,
    windowType: rangeWindowType.value,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
).maybeExecute

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  rateLimitedSetValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useRateLimiter Example 1</h1>
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
            <td>RateLimited Count:</td>
            <td>{{ rateLimitedCount }}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimiter Example 2</h1>
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
          :value="searchText"
          @input="handleSearchChange"
          placeholder="Type to search..."
          :style="{ width: '100%' }"
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{{ searchText }}</td>
          </tr>
          <tr>
            <td>RateLimited Search:</td>
            <td>{{ rateLimitedSearchText }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimiter Example 3</h1>
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
            :value="limitedValue"
            disabled
            :style="{ width: '100%' }"
          /><span>{{ limitedValue }}</span></label
        >
      </div>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
