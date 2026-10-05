<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useDebouncedState } from '@tanstack/vue-pacer/debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

const instantCountRef = ref(0)

const [debouncedCount, setDebouncedCount, counterDebouncer] = useDebouncedState(
  instantCount.value,
  () => ({
    wait: 500,
    // enabled: () => instantCountRef.value > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
)

function increment() {
  const nextCount = ++instantCountRef.value
  instantCount.value = nextCount
  setDebouncedCount(nextCount)
}

const instantSearch = ref('')

const instantSearchRef = ref('')

const [debouncedSearch, setDebouncedSearch, searchDebouncer] =
  useDebouncedState(instantSearch.value, () => ({
    wait: 500,
    enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
  }))

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setDebouncedSearch(newValue)
}

const currentValue = ref(50)

const instantExecutionCount = ref(0)

const [debouncedValue, setDebouncedValue, rangeDebouncer] = useDebouncedState(
  currentValue.value,
  () => ({
    wait: 250,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value = instantExecutionCount.value + 1
  setDebouncedValue(newValue)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useDebouncedState Example 1</h1>
      <table>
        <tbody>
          <counterDebouncer.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, executionCount }"
            ><tr>
              <td>Is Pending:</td>
              <td>{{ isPending.toString() }}</td>
            </tr>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td :colspan="2"><hr /></td>
            </tr>
            <tr>
              <td>Instant Count:</td>
              <td>{{ instantCount }}</td>
            </tr>
            <tr>
              <td>Debounced Count:</td>
              <td>{{ debouncedCount }}</td>
            </tr></counterDebouncer.Subscribe
          >
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
      <counterDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </counterDebouncer.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncedState Example 2</h1>
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
          <searchDebouncer.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, executionCount }"
            ><tr>
              <td>Is Pending:</td>
              <td>{{ isPending.toString() }}</td>
            </tr>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
            <tr>
              <td :colspan="2"><hr /></td>
            </tr>
            <tr>
              <td>Instant Search:</td>
              <td>{{ instantSearch }}</td>
            </tr>
            <tr>
              <td>Debounced Search:</td>
              <td>{{ debouncedSearch }}</td>
            </tr></searchDebouncer.Subscribe
          >
        </tbody>
      </table>
      <searchDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </searchDebouncer.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncedState Example 3</h1>
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
          >Debounced Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            :value="debouncedValue"
            disabled
            :style="{ width: '100%' }"
          /><span>{{ debouncedValue }}</span></label
        >
      </div>
      <table>
        <tbody>
          <rangeDebouncer.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, executionCount }"
            ><tr>
              <td>Is Pending:</td>
              <td>{{ isPending.toString() }}</td>
            </tr>
            <tr>
              <td>Instant Executions:</td>
              <td>{{ instantExecutionCount }}</td>
            </tr>
            <tr>
              <td>Debounced Executions:</td>
              <td>{{ executionCount }}</td>
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
            </tr></rangeDebouncer.Subscribe
          >
        </tbody>
      </table>
      <div :style="{ color: '#666', fontSize: '0.9em' }">
        <p>Debounced to 250ms wait time</p>
      </div>
      <rangeDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre :style="{ marginTop: '20px' }">{{
          JSON.stringify(state, null, 2)
        }}</pre>
      </rangeDebouncer.Subscribe>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
