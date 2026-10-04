<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer/debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)

function increment() {
  instantCount.value = instantCount.value + 1
}

const [debouncedCount] = useDebouncedValue(
  () => instantCount.value,
  () => ({
    wait: 500,
    // enabled: () => instantCount > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  }),
)

const instantSearch = ref('')

const [debouncedSearch] = useDebouncedValue(
  () => instantSearch.value,
  () => ({
    wait: 500,
    enabled: instantSearch.value.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}

const currentValue = ref(50)

const submittedCount = ref(1)

const [debouncedValue, debouncer] = useDebouncedValue(
  () => currentValue.value,
  () => ({
    wait: 250,
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
      <h1>TanStack Pacer useDebouncedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{{ instantCount }}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{{ debouncedCount }}</td>
          </tr>
        </tbody>
      </table>
      <div><button @click="increment">Increment</button></div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 2</h1>
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
            <td>Debounced Search:</td>
            <td>{{ debouncedSearch }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 3</h1>
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
      <debouncer.Subscribe
        :selector="
          (state) => ({
            isPending: state.isPending,
            executionCount: state.executionCount,
          })
        "
        v-slot="{ isPending, executionCount }"
        ><table>
          <tbody>
            <tr>
              <td>Is Pending:</td>
              <td>{{ isPending.toString() }}</td>
            </tr>
            <tr>
              <td>Values Submitted:</td>
              <td>{{ submittedCount }}</td>
            </tr>
            <tr>
              <td>Debounced Executions:</td>
              <td>{{ executionCount }}</td>
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
          <p>Debounced to 250ms wait time</p>
        </div></debouncer.Subscribe
      >
      <pre
        :style="{ marginTop: '20px' }"
      ><debouncer.Subscribe :selector="(state) => state" v-slot="state">{{ JSON.stringify(state, null, 2) }}</debouncer.Subscribe></pre>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
