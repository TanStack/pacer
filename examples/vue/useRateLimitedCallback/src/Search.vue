<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimitedCallback } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const searchText = ref('')

const searchTextRef = ref('')

const rateLimitedSearchText = ref('')

const rateLimitedSetSearch = useRateLimitedCallback(
  (value: typeof rateLimitedSearchText.value) => {
    rateLimitedSearchText.value = value
  },
  () => ({
    limit: 5,
    window: 5000,
    windowType: windowType.value,
    enabled: () => searchTextRef.value.length > 2,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
)

function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTextRef.value = newValue
  searchText.value = newValue
  rateLimitedSetSearch(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimitedCallback Example 2</h1>
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
        :value="searchText"
        @input="handleSearchChange"
        placeholder="Type to search..."
        :style="{ width: '100%' }"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Search:</td>
          <td>{{ searchText }}</td>
        </tr>
        <tr>
          <td>RateLimited Search:</td>
          <td>{{ rateLimitedSearchText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
