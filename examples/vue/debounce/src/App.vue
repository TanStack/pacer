<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from '@tanstack/vue-pacer'

const instantValue = ref('')
const debouncedValue = ref('')
const instantCount = ref(0)
const debouncedCount = ref(0)

const debouncedSetValue = debounce(
  (value: string) => {
    debouncedValue.value = value
    debouncedCount.value++
  },
  { wait: 500 },
)

function handleInputChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  instantValue.value = newValue
  instantCount.value++
  debouncedSetValue(newValue)
}
</script>

<template>
  <div>
    <h1>TanStack Pacer debounce Example</h1>
    <p>
      This example shows the standalone <code>debounce</code> function without
      using the composable pattern.
    </p>

    <div>
      <input
        autofocus
        type="search"
        :value="instantValue"
        @input="handleInputChange"
        placeholder="Type to search..."
        style="width: 100%; padding: 8px; margin-bottom: 1rem"
      />
    </div>

    <table>
      <tbody>
        <tr>
          <td>Instant Value:</td>
          <td>{{ instantValue || '(empty)' }}</td>
        </tr>
        <tr>
          <td>Debounced Value:</td>
          <td>{{ debouncedValue || '(empty)' }}</td>
        </tr>
        <tr>
          <td colspan="2">
            <hr />
          </td>
        </tr>
        <tr>
          <td>Instant Updates:</td>
          <td>{{ instantCount }}</td>
        </tr>
        <tr>
          <td>Debounced Updates:</td>
          <td>{{ debouncedCount }}</td>
        </tr>
        <tr>
          <td>Updates Saved:</td>
          <td>{{ instantCount - debouncedCount }}</td>
        </tr>
        <tr>
          <td>% Reduction:</td>
          <td>
            {{
              instantCount === 0
                ? '0'
                : Math.round(
                    ((instantCount - debouncedCount) / instantCount) * 100,
                  )
            }}%
          </td>
        </tr>
      </tbody>
    </table>

    <div style="color: #666; font-size: 0.9em; margin-top: 1rem">
      <p>Debounced with 500ms wait time</p>
    </div>
  </div>
</template>
