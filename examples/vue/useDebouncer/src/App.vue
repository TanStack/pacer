<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

// Example 1: Counter with debouncing
const instantCount = ref(0)
const debouncedCount = ref(0)

const debouncer = useDebouncer(
  (value: number) => {
    debouncedCount.value = value
  },
  {
    wait: 800,
    enabled: () => instantCount.value > 2,
  },
)

function increment() {
  instantCount.value++
  debouncer.maybeExecute(instantCount.value)
}

// Example 2: Search input debouncing
const searchText = ref('')
const debouncedSearchText = ref('')

const setSearchDebouncer = useDebouncer(
  (value: string) => {
    debouncedSearchText.value = value
  },
  {
    wait: 500,
    enabled: () => searchText.value.length > 2,
  },
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchText.value = newValue
  setSearchDebouncer.maybeExecute(newValue)
}

// Example 3: Range slider debouncing
const currentValue = ref(50)
const debouncedValue = ref(50)
const instantExecutionCount = ref(0)

const setValueDebouncer = useDebouncer(
  (value: number) => {
    debouncedValue.value = value
  },
  {
    wait: 250,
  },
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  instantExecutionCount.value++
  setValueDebouncer.maybeExecute(newValue)
}
</script>

<template>
  <div>
    <!-- Example 1: Counter with debouncing -->
    <div>
      <h1>TanStack Pacer useDebouncer Example 1</h1>
      <table>
        <tbody>
          <debouncer.Subscribe
            :selector="
              (state) => ({
                status: state.status,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ status, executionCount }"
          >
            <tr>
              <td>Status:</td>
              <td>{{ status }}</td>
            </tr>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
          </debouncer.Subscribe>
          <tr>
            <td colspan="2">
              <hr />
            </td>
          </tr>
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
      <div>
        <button @click="increment">Increment</button>
        <button @click="debouncer.flush()" style="margin-left: 10px">
          Flush
        </button>
      </div>
      <debouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </debouncer.Subscribe>
    </div>

    <hr />

    <!-- Example 2: Search input debouncing -->
    <div>
      <h1>TanStack Pacer useDebouncer Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          :value="searchText"
          @input="handleSearchChange"
          placeholder="Type to search..."
          style="width: 100%; margin-bottom: 1rem"
        />
      </div>
      <table>
        <tbody>
          <setSearchDebouncer.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, executionCount }"
          >
            <tr>
              <td>Is Pending:</td>
              <td>{{ isPending }}</td>
            </tr>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
          </setSearchDebouncer.Subscribe>
          <tr>
            <td colspan="2">
              <hr />
            </td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{{ searchText }}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>{{ debouncedSearchText }}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click="setSearchDebouncer.flush()">Flush</button>
      </div>
      <setSearchDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </setSearchDebouncer.Subscribe>
    </div>

    <hr />

    <!-- Example 3: Range slider debouncing -->
    <div>
      <h1>TanStack Pacer useDebouncer Example 3</h1>
      <div style="margin-bottom: 20px">
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            :value="currentValue"
            @input="handleRangeChange"
            style="width: 100%"
          />
          <span>{{ currentValue }}</span>
        </label>
      </div>
      <div style="margin-bottom: 20px">
        <label>
          Debounced Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            :value="debouncedValue"
            readonly
            style="width: 100%"
          />
          <span>{{ debouncedValue }}</span>
        </label>
      </div>
      <table>
        <tbody>
          <setValueDebouncer.Subscribe
            :selector="
              (state) => ({
                isPending: state.isPending,
                executionCount: state.executionCount,
              })
            "
            v-slot="{ isPending, executionCount }"
          >
            <tr>
              <td>Is Pending:</td>
              <td>{{ isPending }}</td>
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
                {{
                  instantExecutionCount === 0
                    ? '0'
                    : Math.round(
                        ((instantExecutionCount - executionCount) /
                          instantExecutionCount) *
                          100,
                      )
                }}%
              </td>
            </tr>
          </setValueDebouncer.Subscribe>
        </tbody>
      </table>
      <div style="color: #666; font-size: 0.9em">
        <p>Debounced to 250ms wait time</p>
      </div>
      <div>
        <button @click="setValueDebouncer.flush()">Flush</button>
      </div>
      <setValueDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </setValueDebouncer.Subscribe>
    </div>
  </div>
</template>
