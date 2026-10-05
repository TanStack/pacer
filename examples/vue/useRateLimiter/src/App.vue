<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import {
  rateLimiterOptions,
  useRateLimiter,
} from '@tanstack/vue-pacer/rate-limiter'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const counterCommonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 5000,
})
const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantCount = ref(0)

const limitedCount = ref(0)

const counterRateLimiter = useRateLimiter(
  (value: typeof limitedCount.value) => {
    limitedCount.value = value
  },
  () => ({
    key: 'counter',
    // enabled: () => instantCount.value > 2,
    ...counterCommonRateLimiterOptions,
    windowType: windowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function increment() {
  const nextCount = ++instantCount.value
  counterRateLimiter.maybeExecute(nextCount)
}

const searchCommonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 5000,
})
const instantSearch = ref('')

const limitedSearch = ref('')

const searchRateLimiter = useRateLimiter(
  (value: typeof limitedSearch.value) => {
    limitedSearch.value = value
  },
  () => ({
    key: 'search',
    enabled: () => instantSearch.value.length > 2, // optional, defaults to true
    ...searchCommonRateLimiterOptions,
    // windowType: 'sliding', // default is 'fixed'
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearch.value = newValue
  searchRateLimiter.maybeExecute(newValue)
}

const currentValue = ref(50)

const limitedValue = ref(50)

const instantExecutionCount = ref(0)

const rangeRateLimiter = useRateLimiter(
  (value: typeof limitedValue.value) => {
    limitedValue.value = value
  },
  () => ({
    key: 'range',
    limit: 20,
    window: 2000,
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
  rangeRateLimiter.maybeExecute(newValue)
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
            name="windowType"
            value="fixed"
            :checked="windowType === 'fixed'"
            @input="() => (windowType = 'fixed')"
          />Fixed Window</label
        ><label
          ><input
            type="radio"
            name="windowType"
            value="sliding"
            :checked="windowType === 'sliding'"
            @input="() => (windowType = 'sliding')"
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
              <td>Remaining in Window:</td>
              <td>{{ counterRateLimiter.getRemainingInWindow() }}</td>
            </tr>
            <tr>
              <td>Ms Until Next Window:</td>
              <td>{{ counterRateLimiter.getMsUntilNextWindow() }}</td>
            </tr>
            <tr>
              <td :colspan="2"><hr /></td>
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
        ><button @click="() => counterRateLimiter.reset()">Reset</button>
      </div>
      <counterRateLimiter.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </counterRateLimiter.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimiter Example 2</h1>
      <div>
        <input
          autofocus
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
              <td>Remaining in Window:</td>
              <td>{{ searchRateLimiter.getRemainingInWindow() }}</td>
            </tr>
            <tr>
              <td>Ms Until Next Window:</td>
              <td>{{ searchRateLimiter.getMsUntilNextWindow() }}</td>
            </tr>
            <tr>
              <td :colspan="2"><hr /></td>
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
      <div><button @click="() => searchRateLimiter.reset()">Reset</button></div>
      <searchRateLimiter.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </searchRateLimiter.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useRateLimiter Example 3</h1>
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
