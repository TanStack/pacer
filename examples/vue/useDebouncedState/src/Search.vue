<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedState } from '@tanstack/vue-pacer/debouncer'

const instantSearch = ref('')

const instantSearchRef = ref('')

const [debouncedSearch, setDebouncedSearch, debouncer] = useDebouncedState(
  instantSearch.value,
  () => ({
    wait: 500,
    enabled: () => instantSearchRef.value.length > 2, // optional, defaults to true
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantSearchRef.value = newValue
  instantSearch.value = newValue
  setDebouncedSearch(newValue)
}
</script>
<template>
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
        <debouncer.Subscribe
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
          </tr></debouncer.Subscribe
        >
      </tbody>
    </table>
    <debouncer.Subscribe :selector="(state) => state" v-slot="state">
      <pre :style="{ marginTop: '20px' }">{{
        JSON.stringify(state, null, 2)
      }}</pre>
    </debouncer.Subscribe>
  </div>
</template>
