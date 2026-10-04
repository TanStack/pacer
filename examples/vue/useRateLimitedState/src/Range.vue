<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedState } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const instantExecutionCount = ref(0)

const [limitedValue, setLimitedValue, rateLimiter] = useRateLimitedState(
  currentValue.value,
  () => ({
    limit: 20,
    window: 2000,
    windowType: windowType.value,
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
    <h1>TanStack Pacer useRateLimitedState Example 3</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType3"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType3"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
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
        <rateLimiter.Subscribe
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
            <td>{{ rateLimiter.getRemainingInWindow() }}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>{{ rateLimiter.getMsUntilNextWindow() }}</td>
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
          </tr></rateLimiter.Subscribe
        >
      </tbody>
    </table>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Rate limited to 20 updates per 2 seconds</p>
    </div>
    <rateLimiter.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </rateLimiter.Subscribe>
  </div>
</template>
