<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useRateLimitedState } from '@tanstack/vue-pacer/rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterAlert = window.alert.bind(window)

const counterWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const instantCountRef = ref(0)

const [limitedCount, setLimitedCount, counterRateLimiter] = useRateLimitedState(
  instantCount.value,
  () => ({
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: counterWindowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setLimitedCount(nextCount)
}

const searchAlert = window.alert.bind(window)

const searchWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantSearch = ref('')

const instantSearchRef = ref('')

const [limitedSearch, setLimitedSearch, searchRateLimiter] =
  useRateLimitedState(instantSearch.value, () => ({
    // enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: searchWindowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }))

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setLimitedSearch(newValue)
}

const rangeWindowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const instantExecutionCount = ref(0)

const [limitedValue, setLimitedValue, rangeRateLimiter] = useRateLimitedState(
  currentValue.value,
  () => ({
    limit: 20,
    window: 2000,
    windowType: rangeWindowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  setLimitedValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 1</h1>
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
          <counterRateLimiter.Subscribe
            :selector="
              (state) => ({
                executionCount: state.executionCount,
                rejectionCount: state.rejectionCount,
              })
            "
            v-slot="{ executionCount, rejectionCount }"
            ><tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Rejection Count:</td>
              <td>{{ rejectionCount }}</td>
            </tr>
            <tr>
              <td>Instant Count:</td>
              <td>{{ instantCount }}</td>
            </tr>
            <tr>
              <td>Rate Limited Count:</td>
              <td>{{ limitedCount }}</td>
            </tr></counterRateLimiter.Subscribe
          >
        </tbody>
      </table>
      <div>
        <button @click="increment">Increment</button
        ><button
          @click="() => counterAlert(counterRateLimiter.getRemainingInWindow())"
        >
          Remaining in Window</button
        ><button @click="() => counterAlert(counterRateLimiter.reset())">
          Reset
        </button>
      </div>
      <counterRateLimiter.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </counterRateLimiter.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 2</h1>
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
          :value="instantSearch"
          @input="handleSearchChange"
          placeholder="Type to search..."
          :style="{ width: '100%' }"
        />
      </div>
      <table>
        <tbody>
          <searchRateLimiter.Subscribe
            :selector="
              (state) => ({
                executionCount: state.executionCount,
                rejectionCount: state.rejectionCount,
              })
            "
            v-slot="{ executionCount, rejectionCount }"
            ><tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Rejection Count:</td>
              <td>{{ rejectionCount }}</td>
            </tr>
            <tr>
              <td>Instant Search:</td>
              <td>{{ instantSearch }}</td>
            </tr>
            <tr>
              <td>Rate Limited Search:</td>
              <td>{{ limitedSearch }}</td>
            </tr></searchRateLimiter.Subscribe
          >
        </tbody>
      </table>
      <div>
        <button
          @click="() => searchAlert(searchRateLimiter.getRemainingInWindow())"
        >
          Remaining in Window</button
        ><button @click="() => searchAlert(searchRateLimiter.reset())">
          Reset
        </button>
      </div>
      <searchRateLimiter.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </searchRateLimiter.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 3</h1>
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
      <table>
        <tbody>
          <rangeRateLimiter.Subscribe
            :selector="
              (state) => ({
                executionCount: state.executionCount,
                rejectionCount: state.rejectionCount,
              })
            "
            v-slot="{ executionCount, rejectionCount }"
            ><tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Rejection Count:</td>
              <td>{{ rejectionCount }}</td>
            </tr>
            <tr>
              <td>Remaining in Window:</td>
              <td>{{ rangeRateLimiter.getRemainingInWindow() }}</td>
            </tr>
            <tr>
              <td>Ms Until Next Window:</td>
              <td>{{ rangeRateLimiter.getMsUntilNextWindow() }}</td>
            </tr>
            <tr>
              <td>Instant Executions:</td>
              <td>{{ instantExecutionCount }}</td>
            </tr>
            <tr>
              <td>Saved Executions:</td>
              <td>{{ instantExecutionCount - executionCount }}</td>
            </tr>
            <tr>
              <td>% Reduction:</td>
              <td>
                <template v-if="instantExecutionCount === 0">{{ '0' }}</template
                ><template v-else>{{
                  Math.round(
                    ((instantExecutionCount - executionCount) /
                      instantExecutionCount) *
                      100,
                  )
                }}</template
                >%
              </td>
            </tr></rangeRateLimiter.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <rangeRateLimiter.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </rangeRateLimiter.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
