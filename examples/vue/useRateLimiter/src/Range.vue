<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimiter } from '@tanstack/vue-pacer/rate-limiter'
const currentValue = ref(50)

const limitedValue = ref(50)

const instantExecutionCount = ref(0)

const rateLimiter = useRateLimiter(
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
  rateLimiter.maybeExecute(newValue)
}
</script>
<template>
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
