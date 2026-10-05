<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

const instantCount = ref(0)
const debouncedCount = ref(0)
const debouncer = useDebouncer(
  (count: number) => {
    debouncedCount.value = count
  },
  {
    key: 'counter',
    wait: 800,
    enabled: () => instantCount.value > 2,
    // leading: true, // optional, defaults to false
  },
  // Alternative to Subscribe: select state here to update this component.
  // (state) => state,
)

function increment() {
  debouncer.maybeExecute(++instantCount.value)
}

const searchText = ref('')
const debouncedSearchText = ref('')
const setSearchDebouncer = useDebouncer(
  (value: string) => {
    debouncedSearchText.value = value
  },
  { key: 'search', wait: 500, enabled: () => searchText.value.length > 2 },
)

function handleSearchChange(event: Event) {
  searchText.value = (event.target as HTMLInputElement).value
  setSearchDebouncer.maybeExecute(searchText.value)
}

const currentValue = ref(50)
const debouncedValue = ref(50)
const instantExecutionCount = ref(0)
const wait = ref(250)
const enabled = ref(true)
const setValueDebouncer = useDebouncer(
  (value: number) => {
    debouncedValue.value = value
  },
  () => ({ key: 'range', wait: wait.value, enabled: enabled.value }),
)

function handleRangeChange(event: Event) {
  currentValue.value = (event.target as HTMLInputElement).valueAsNumber
  instantExecutionCount.value++
  setValueDebouncer.maybeExecute(currentValue.value)
}
</script>

<template>
  <div>
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
            <td colspan="2"><hr /></td>
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
              <td>{{ isPending.toString() }}</td>
            </tr>
            <tr>
              <td>Execution Count:</td>
              <td>{{ executionCount }}</td>
            </tr>
          </setSearchDebouncer.Subscribe>
          <tr>
            <td colspan="2"><hr /></td>
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
      <div><button @click="setSearchDebouncer.flush()">Flush</button></div>
      <setSearchDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </setSearchDebouncer.Subscribe>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useDebouncer Example 3</h1>
      <fieldset>
        <legend>Reactive options</legend>
        <label>
          Delay: {{ wait }} ms<input
            type="range"
            min="0"
            max="1500"
            step="50"
            v-model.number="wait"
          />
        </label>
        <label><input type="checkbox" v-model="enabled" />Enabled</label>
        <p>
          Changing the delay affects the next scheduled call. Disabling cancels
          pending work.
        </p>
      </fieldset>
      <div style="margin-bottom: 20px">
        <label
          >Current Range:<input
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
        <label
          >Debounced Range (Readonly):<input
            type="range"
            min="0"
            max="100"
            :value="debouncedValue"
            disabled
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
        <p>Debounced to {{ wait }}ms wait time</p>
      </div>
      <div><button @click="setValueDebouncer.flush()">Flush</button></div>
      <setValueDebouncer.Subscribe :selector="(state) => state" v-slot="state">
        <pre style="margin-top: 20px">{{ JSON.stringify(state, null, 2) }}</pre>
      </setValueDebouncer.Subscribe>
    </div>
  </div>

  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
