<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

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
</script>

<template>
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
</template>
