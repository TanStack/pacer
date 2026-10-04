<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncDebouncer } from '@tanstack/vue-pacer/async-debouncer'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface SearchResult {
  id: number
  title: string
}
// Simulate API call with fake data
const fakeApi = async (term: string): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
  if (term === 'error') {
    throw new Error('Simulated API error')
  }
  return [
    { id: 1, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 2, title: `${term} result ${Math.floor(Math.random() * 100)}` },
    { id: 3, title: `${term} result ${Math.floor(Math.random() * 100)}` },
  ]
}
const searchTerm = ref('')

const results = ref<Array<SearchResult>>([])

const isLoading = ref(false)

const error = ref<string | null>(null)

const debouncedSearch = useAsyncDebouncer(
  async (term: string) => {
    if (!term.trim()) {
      results.value = []
      return []
    }
    isLoading.value = true
    error.value = null
    try {
      const data = await fakeApi(term)
      results.value = data
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      results.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  },
  () => ({
    wait: 500,
    // leading: true, // optional, defaults to false
    // trailing: true, // optional, defaults to true
  }),
).maybeExecute

async function handleSearchChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  searchTerm.value = newValue
  try {
    await debouncedSearch(newValue)
  } catch (err) {
    // Error is already handled in the debounced function
    console.log('Search failed:', err)
  }
}

const count = ref(0)

const apiCallCount = ref(0)

// Simulate API call that returns a value
const incrementApi = async (value: number): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const newCount = value + 1
  apiCallCount.value = apiCallCount.value + 1
  return newCount
}

const debouncedIncrement = useAsyncDebouncer(
  async (currentValue: number) => {
    const result = await incrementApi(currentValue)
    count.value = result
    return result
  },
  () => ({
    wait: 1000,
    leading: false, // Don't execute immediately
    trailing: true, // Execute after delay
  }),
).maybeExecute

function handleIncrement() {
  // Update local state immediately for instant feedback
  const newCount = count.value + 1
  count.value = newCount
  // Debounced API call
  debouncedIncrement(newCount)
}

const email = ref('')

const validationResult = ref<{
  isValid: boolean
  message: string
} | null>(null)

const isValidating = ref(false)

// Simulate email validation API
const validateEmail = async (
  emailAddress: string,
): Promise<{
  isValid: boolean
  message: string
}> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(emailAddress)
  return {
    isValid,
    message: isValid ? 'Email is valid!' : 'Please enter a valid email address',
  }
}

const debouncedValidateEmail = useAsyncDebouncer(
  async (emailAddress: string) => {
    if (!emailAddress.trim()) {
      validationResult.value = null
      return null
    }
    isValidating.value = true
    try {
      const result = await validateEmail(emailAddress)
      validationResult.value = result
      return result
    } finally {
      isValidating.value = false
    }
  },
  () => ({
    wait: 750,
    leading: false,
  }),
).maybeExecute

function handleEmailChange(e: Event) {
  const newEmail = (e.target as HTMLInputElement).value
  email.value = newEmail
  debouncedValidateEmail(newEmail)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useAsyncDebouncer Example 1</h1>
      <div>
        <input
          type="search"
          :value="searchTerm"
          @input="handleSearchChange"
          placeholder="Type to search... (try 'error' to see error handling)"
          :style="{ width: '100%', marginBottom: '10px' }"
        />
      </div>
      <template v-if="isLoading"
        ><p :style="{ color: 'blue' }">Searching...</p></template
      ><template v-if="error"
        ><p :style="{ color: 'red' }">Error: {{ error }}</p></template
      >
      <div>
        <p>Current search term: {{ searchTerm }}</p>
        <template v-if="results.length > 0"
          ><div>
            <h3>Results:</h3>
            <ul>
              <template v-for="(result, index) in results" :key="index"
                ><li>{{ result.title }}</li></template
              >
            </ul>
          </div></template
        >
      </div>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncDebouncer Example 2</h1>
      <table>
        <tbody>
          <tr>
            <td>Current Count:</td>
            <td>{{ count }}</td>
          </tr>
          <tr>
            <td>API Calls Made:</td>
            <td>{{ apiCallCount }}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button @click="handleIncrement">Increment (debounced API call)</button>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Click rapidly - API calls are debounced to 1 second, but UI updates
        immediately
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncDebouncer Example 3</h1>
      <div :style="{ marginBottom: '20px' }">
        <label
          >Email Address:<input
            type="email"
            :value="email"
            @input="handleEmailChange"
            placeholder="Enter your email..."
            :style="{
              width: '100%',
              marginTop: '5px',
              padding: '8px',
              borderColor:
                validationResult?.isValid === false
                  ? 'red'
                  : validationResult?.isValid === true
                    ? 'green'
                    : 'initial',
            }"
        /></label>
      </div>
      <template v-if="isValidating"
        ><p :style="{ color: 'blue' }">Validating email...</p></template
      ><template v-if="validationResult"
        ><p
          :style="{
            color: validationResult.isValid ? 'green' : 'red',
            fontWeight: 'bold',
          }"
        >
          {{ validationResult.message }}
        </p></template
      >
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Email validation is debounced to 750ms after you stop typing
      </p>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
