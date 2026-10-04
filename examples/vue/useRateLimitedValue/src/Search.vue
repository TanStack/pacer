<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedValue } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const instantSearch = ref('')

const [limitedSearch] = useRateLimitedValue(
  () => instantSearch.value,
  () => ({
    // enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: windowType.value,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  }),
)

function handleSearchChange(e: Event) {
  instantSearch.value = (e.target as HTMLInputElement).value
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType2"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType2"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
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
          <td>Rate Limited Search:</td>
          <td>{{ limitedSearch }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
