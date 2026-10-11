<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref, computed } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'
import { useThrottler } from '@tanstack/vue-pacer/throttler'
import { useRateLimiter } from '@tanstack/vue-pacer/rate-limiter'
import { useQueuer } from '@tanstack/vue-pacer/queuer'
import { useBatcher } from '@tanstack/vue-pacer/batcher'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface ComparisonState {
  executionCount: number
  status: string
  rejectionCount?: number
  size?: number
  totalItemsProcessed?: number
}
const selectState = (state: ComparisonState) => state
function explainReadonly() {
  window.alert('These sliders are read-only. Move the main slider at the top')
}
const currentValue = ref(50)

const instantExecutionCount = ref(0)

const debouncedValue = ref(50)

const throttledValue = ref(50)

const rateLimitedValue = ref(50)

const queuedValue = ref(50)

const batchedValue = ref(50)

const debouncer = useDebouncer(
  (value: typeof debouncedValue.value) => {
    debouncedValue.value = value
  },
  () => ({
    key: 'my-debouncer',
    wait: 600,
  }),
)

const throttler = useThrottler(
  (value: typeof throttledValue.value) => {
    throttledValue.value = value
  },
  () => ({
    key: 'my-throttler',
    wait: 600,
  }),
)

const rateLimiter = useRateLimiter(
  (value: typeof rateLimitedValue.value) => {
    rateLimitedValue.value = value
  },
  () => ({
    key: 'my-rate-limiter',
    limit: 20,
    window: 2000,
    windowType: 'sliding',
  }),
)

const queuer = useQueuer(
  (value: typeof queuedValue.value) => {
    queuedValue.value = value
  },
  () => ({
    key: 'my-queuer',
    wait: 100,
    maxSize: 50,
  }),
)

const batcher = useBatcher(
  (items: Array<number>) => {
    // Use the last item in the batch as the displayed value
    if (items.length > 0) {
      batchedValue.value = items[items.length - 1]!
    }
  },
  () => ({
    key: 'my-batcher',
    wait: 600,
    maxSize: 5,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  // Trigger each utility
  debouncer.maybeExecute(newValue)
  throttler.maybeExecute(newValue)
  rateLimiter.maybeExecute(newValue)
  queuer.addItem(newValue)
  batcher.addItem(newValue)
}

// Helper function to determine sync status
// Note: This function will be called from within Subscribe components, so it receives state as parameter
function getSyncStatus(
  processedValue: number,
  utilityName: string,
  utilityState?: { status: string },
) {
  const isOutOfSync = processedValue !== currentValue.value
  const isPending =
    (utilityName === 'Debouncer' && utilityState?.status === 'pending') ||
    (utilityName === 'Throttler' && utilityState?.status === 'pending') ||
    (utilityName === 'Queuer' && utilityState?.status === 'running') ||
    (utilityName === 'Batcher' && utilityState?.status === 'pending')
  // Tooltip explanations for why certain utilities become out of sync
  const getTooltip = () => {
    if (!isOutOfSync) return undefined
    switch (utilityName) {
      case 'Rate Limiter':
        return isPending
          ? 'Rate limiter is processing within limits'
          : 'Rate limiters reject executions when the limit is exceeded. Rejected calls are discarded entirely and never processed, causing the value to lag behind rapid changes.'
      case 'Queuer':
        return isPending
          ? 'Queuer is processing items from the queue'
          : 'Queuers reject new items when their buffer is full. If items are added faster than they can be processed, the buffer overflows and newer items are dropped.'
      default:
        return undefined
    }
  }
  return {
    isOutOfSync,
    isPending,
    statusText: isOutOfSync
      ? isPending
        ? 'Processing...'
        : 'Out of sync'
      : 'Synced',
    tooltip: getTooltip(),
  }
}

const utilityMetadata = computed(
  () =>
    [
      {
        name: 'Debouncer',
        value: debouncedValue.value,
        description: `Delays execution until after ${debouncer.options.wait}ms of inactivity`,
        color: '#3b82f6', // blue
        flush: () => debouncer.flush(),
        util: debouncer,
      },
      {
        name: 'Throttler',
        value: throttledValue.value,
        description: `Limits execution to once every ${throttler.options.wait}ms`,
        color: '#0891b2', // cyan
        flush: () => throttler.flush(),
        util: throttler,
      },
      {
        name: 'Rate Limiter',
        value: rateLimitedValue.value,
        description: `Allows max ${rateLimiter.options.limit} executions per ${rateLimiter.options.window}ms window`,
        color: '#ea580c', // orange
        util: rateLimiter,
      },
      {
        name: 'Queuer',
        value: queuedValue.value,
        description: `Processes items sequentially with ${queuer.options.wait}ms delay`,
        color: '#db2777', // pink
        flush: () => queuer.flush(),
        util: queuer,
      },
      {
        name: 'Batcher',
        value: batchedValue.value,
        description: `Processes in batches of ${batcher.options.maxSize} or after ${batcher.options.wait}ms`,
        color: '#8b5cf6', // purple
        flush: () => batcher.flush(),
        util: batcher,
      },
    ] as const,
)
</script>

<template>
  <div
    :style="{
      padding: '12px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '100%',
    }"
  >
    <h1 :style="{ fontSize: '1.5em', marginBottom: '15px' }">
      TanStack Pacer Utilities Comparison
    </h1>
    <div :style="{ marginBottom: '20px' }">
      <h2 :style="{ fontSize: '1.2em', marginBottom: '10px' }">
        Instant Slider (Move this slider to see the utilities in action)
      </h2>
      <div :style="{ marginBottom: '15px' }">
        <label
          ><strong>Current Value: {{ currentValue }}</strong
          ><input
            max="100"
            min="0"
            @input="handleRangeChange"
            :style="{ width: '100%', margin: '8px 0' }"
            type="range"
            :value="currentValue"
        /></label>
      </div>
      <div :style="{ marginBottom: '15px' }">
        <strong>Total Interactions:</strong>{{ ' ' }}{{ instantExecutionCount }}
      </div>
    </div>
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        marginBottom: '30px',
      }"
    >
      <template v-for="(utility, index) in utilityMetadata" :key="index"
        ><component
          :is="utility.util.Subscribe"
          :selector="selectState"
          v-slot="state"
          ><div
            :style="{
              border: `2px solid ${utility.color}`,
              borderRadius: '6px',
              padding: '10px',
              backgroundColor: getSyncStatus(utility.value, utility.name, state)
                .isPending
                ? 'rgba(254, 249, 195, 0.4)' // yellowish if pending
                : getSyncStatus(utility.value, utility.name, state).isOutOfSync
                  ? 'rgba(254, 226, 226, 0.4)' // reddish if out of sync
                  : 'rgba(209, 250, 229, 0.4)', // greenish if synced
              transition: 'background-color 0.2s ease',
            }"
          >
            <h3
              :style="{
                color: utility.color,
                margin: '0 0 8px 0',
                fontSize: '1.1em',
              }"
            >
              {{ utility.name }}
            </h3>
            <p
              :style="{
                fontSize: '0.85em',
                color: '#666',
                margin: '0 0 12px 0',
                lineHeight: '1.4',
              }"
            >
              {{ utility.description }}
            </p>
            <div :style="{ marginBottom: '12px' }">
              <div :style="{ marginBottom: '4px' }">
                <strong :style="{ fontSize: '0.9em' }"
                  >Value: {{ utility.value }}</strong
                >
              </div>
              <div :style="{ marginBottom: '6px' }">
                <template
                  v-if="
                    getSyncStatus(utility.value, utility.name, state)
                      .isOutOfSync
                  "
                  ><span
                    :style="{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: getSyncStatus(utility.value, utility.name, state)
                        .isPending
                        ? '#f59e0b'
                        : '#ef4444',
                      fontSize: '0.8em',
                      cursor: getSyncStatus(utility.value, utility.name, state)
                        .tooltip
                        ? 'help'
                        : 'default',
                    }"
                    :title="
                      getSyncStatus(utility.value, utility.name, state).tooltip
                    "
                    ><svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      style="display: inline-block; vertical-align: middle"
                    >
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" /></svg
                    >{{
                      getSyncStatus(utility.value, utility.name, state)
                        .statusText
                    }}</span
                  ></template
                ><template v-else
                  ><span
                    :style="{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: '#10b981',
                      fontSize: '0.8em',
                    }"
                    ><svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      style="display: inline-block; vertical-align: middle"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22,4 12,14.01 9,11.01" /></svg
                    >{{
                      getSyncStatus(utility.value, utility.name, state)
                        .statusText
                    }}</span
                  ></template
                >
              </div>
              <input
                @click="explainReadonly"
                type="range"
                min="0"
                max="100"
                :value="utility.value"
                disabled
                :style="{
                  width: '100%',
                  margin: '2px 0',
                  accentColor: utility.color,
                }"
              />
            </div>
            <div
              :style="{
                fontSize: '0.8em',
                marginBottom: '12px',
                lineHeight: '1.3',
              }"
            >
              <div>
                <strong>Executions:</strong>{{ ' ' }}{{ state.executionCount }}
              </div>
              <div>
                <strong>Reduction:</strong>{{ ' '
                }}<template v-if="instantExecutionCount === 0">{{
                  '0'
                }}</template
                ><template v-else>{{
                  Math.round(
                    ((instantExecutionCount - state.executionCount) /
                      instantExecutionCount) *
                      100,
                  )
                }}</template
                >%
              </div>
              <template v-if="utility.name === 'Rate Limiter'"
                ><div>
                  <strong>Rejections:</strong>{{ ' '
                  }}{{ state.rejectionCount }}
                </div></template
              ><template v-if="utility.name === 'Queuer'"
                ><div>
                  <strong>Queue Size:</strong>{{ ' ' }}{{ state.size }}
                </div></template
              ><template v-if="utility.name === 'Batcher'"
                ><div>
                  <strong>Batch Size:</strong>{{ ' ' }}{{ state.size }}
                </div>
                <div>
                  <strong>Items Processed:</strong>{{ ' '
                  }}{{ state.totalItemsProcessed }}
                </div></template
              >
              <div><strong>Status:</strong>{{ ' ' }}{{ state.status }}</div>
            </div>
            <template
              v-if="'flush' in utility &amp;&amp;
    typeof utility.flush === 'function'"
              ><button
                @click="utility.flush"
                :style="{
                  backgroundColor: utility.color,
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  width: '100%',
                }"
              >
                Flush
              </button></template
            >
          </div></component
        ></template
      >
    </div>
    <div :style="{ marginTop: '20px' }">
      <h2 :style="{ fontSize: '1.2em', marginBottom: '10px' }">
        Detailed States
      </h2>
      <div
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '8px',
        }"
      >
        <template v-for="(utility, index) in utilityMetadata" :key="index"
          ><component
            :is="utility.util.Subscribe"
            :selector="selectState"
            v-slot="state"
            ><div>
              <h4
                :style="{
                  color: utility.color,
                  margin: '0 0 5px 0',
                  fontSize: '0.9em',
                }"
              >
                {{ utility.name }} State
              </h4>
              <pre
                :style="{
                  fontSize: '0.7em',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  margin: 0,
                }"
                >{{ JSON.stringify(state, null, 2) }}</pre>
            </div></component
          ></template
        >
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
