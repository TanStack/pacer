<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useRateLimitedValue } from '@tanstack/vue-pacer/rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const [limitedCount] = useRateLimitedValue(
  () => instantCount.value,
  () => ({
    // enabled: () => instantCount > 2, // optional, defaults to true
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
  instantCount.value = instantCount.value + 1
}

const searchWindowType = ref<'fixed' | 'sliding'>('fixed')

const instantSearch = ref('')

const [limitedSearch] = useRateLimitedValue(
  () => instantSearch.value,
  () => ({
    // enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: searchWindowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}

const rangeWindowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const submittedCount = ref(1)

const [limitedValue, rateLimiter] = useRateLimitedValue(
  () => currentValue.value,
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
  submittedCount.value = submittedCount.value + 1
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 1</h1>
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
            <td>{{ limitedCount }}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
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
          <tr>
            <td>Instant Search:</td>
            <td>{{ instantSearch }}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{{ limitedSearch }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 3</h1>
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
      <rateLimiter.Subscribe
        :selector="
          (state) => ({
            executionCount: state.executionCount,
            rejectionCount: state.rejectionCount,
          })
        "
        v-slot="{ executionCount, rejectionCount }"
        ><table>
          <tbody>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td>Rejection Count:</td>
              <td>{{ rejectionCount }}</td>
            </tr>
            <tr>
              <td>Remaining in Window:</td>
              <td>{{ rateLimiter.getRemainingInWindow() }}</td>
            </tr>
            <tr>
              <td>Ms Until Next Window:</td>
              <td>{{ rateLimiter.getMsUntilNextWindow() }}</td>
            </tr>
            <tr>
              <td>Values Submitted:</td>
              <td>{{ submittedCount }}</td>
            </tr>
            <tr>
              <td>Saved Executions:</td>
              <td>{{ submittedCount - executionCount }}</td>
            </tr>
            <tr>
              <td>% Reduction:</td>
              <td>
                <template v-if="submittedCount === 0">{{ '0' }}</template
                ><template v-else>{{
                  Math.round(
                    ((submittedCount - executionCount) / submittedCount) * 100,
                  )
                }}</template
                >%
              </td>
            </tr>
          </tbody>
        </table>
        <div :style="{ color: '#666', fontSize: '0.9em' }">
          <p>Rate limited to 20 updates per 2 seconds</p>
        </div></rateLimiter.Subscribe
      >
      <pre
        :style="{ marginTop: '20px' }"
      ><rateLimiter.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</rateLimiter.Subscribe></pre>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
