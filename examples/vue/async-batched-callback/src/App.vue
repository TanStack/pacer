<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import { ref } from 'vue'
import { useAsyncBatcher } from '@tanstack/vue-pacer/async-batcher'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]

interface SearchResult {
  id: number
  title: string
  query: string
}
// Simulate batched API search call
const batchedSearchApi = async (
  queries: Array<string>,
): Promise<Array<SearchResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
  if (queries.some((q) => q === 'error')) {
    throw new Error('Simulated batch API error')
  }
  return queries.flatMap((query, index) => [
    { id: index * 10 + 1, title: `${query} result 1`, query },
    { id: index * 10 + 2, title: `${query} result 2`, query },
  ])
}
const searchQueries = ref<Array<string>>([])

const results = ref<Array<SearchResult>>([])

const isLoading = ref(false)

const displayedError = ref<string | null>(null)

const counterBatchesProcessed = ref(0)

const batchedSearch = useAsyncBatcher(
  async (queries: Array<string>) => {
    isLoading.value = true
    displayedError.value = null
    try {
      const data = await batchedSearchApi(queries)
      results.value = [...results.value, ...data]
      counterBatchesProcessed.value = counterBatchesProcessed.value + 1
      return data
    } finally {
      isLoading.value = false
    }
  },
  () => ({
    maxSize: 3, // Process when 3 queries collected
    wait: 2000, // Or after 2 seconds
    throwOnError: false,
    onError: (error) => {
      displayedError.value =
        error instanceof Error ? error.message : 'Unknown error'
    },
  }),
).addItem

function handleSearch(query: string) {
  if (!query.trim()) return
  searchQueries.value = [...searchQueries.value, query]
  batchedSearch(query)
}

interface EmailValidationRequest {
  email: string
  timestamp: Date
}
interface EmailValidationResult {
  email: string
  isValid: boolean
  message: string
}
// Simulate batched email validation API
const batchValidateEmails = async (
  requests: Array<EmailValidationRequest>,
): Promise<Array<EmailValidationResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return requests.map((request) => ({
    email: request.email,
    isValid: emailRegex.test(request.email),
    message: emailRegex.test(request.email)
      ? 'Email is valid!'
      : 'Invalid email format',
  }))
}
const emailRequests = ref<Array<EmailValidationRequest>>([])

const validationResults = ref<Array<EmailValidationResult>>([])

const isValidating = ref(false)

const searchBatchesProcessed = ref(0)

const batchedValidateEmail = useAsyncBatcher(
  async (requests: Array<EmailValidationRequest>) => {
    isValidating.value = true
    try {
      const results = await batchValidateEmails(requests)
      validationResults.value = [...validationResults.value, ...results]
      searchBatchesProcessed.value = searchBatchesProcessed.value + 1
      return results
    } finally {
      isValidating.value = false
    }
  },
  () => ({
    maxSize: 4, // Process when 4 emails collected
    wait: 1500, // Or after 1.5 seconds
  }),
).addItem

function validateEmail(email: string) {
  if (!email.trim()) return
  const request: EmailValidationRequest = {
    email,
    timestamp: new Date(),
  }
  emailRequests.value = [...emailRequests.value, request]
  batchedValidateEmail(request)
}

const sampleEmails = [
  'user@example.com',
  'invalid-email',
  'test@domain.org',
  'bad@email',
  'good@test.com',
]

interface DataPoint {
  id: string
  value: number
  category: string
}
// Simulate batched data processing API
const batchProcessData = async (
  dataPoints: Array<DataPoint>,
): Promise<{
  processed: Array<DataPoint>
  summary: any
}> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // Simulate processing
  const processed = dataPoints.map((point) => ({
    ...point,
    value: point.value * 2, // Double the values as "processing"
  }))
  const summary = {
    totalItems: processed.length,
    totalValue: processed.reduce((sum, point) => sum + point.value, 0),
    categories: [...new Set(processed.map((p) => p.category))].length,
  }
  return { processed, summary }
}
const dataQueue = ref<Array<DataPoint>>([])

const processedData = ref<Array<DataPoint>>([])

const summaries = ref<Array<any>>([])

const isProcessing = ref(false)

const rangeBatchesProcessed = ref(0)

const batchedDataProcessor = useAsyncBatcher(
  async (dataPoints: Array<DataPoint>) => {
    isProcessing.value = true
    try {
      const result = await batchProcessData(dataPoints)
      processedData.value = [...processedData.value, ...result.processed]
      summaries.value = [...summaries.value, result.summary]
      rangeBatchesProcessed.value = rangeBatchesProcessed.value + 1
      return result
    } finally {
      isProcessing.value = false
    }
  },
  () => ({
    maxSize: 5, // Process when 5 data points collected
    wait: 2500, // Or after 2.5 seconds
  }),
).addItem

function addDataPoint(category: string) {
  const dataPoint: DataPoint = {
    id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    value: Math.floor(Math.random() * 100) + 1,
    category,
  }
  dataQueue.value = [...dataQueue.value, dataPoint]
  batchedDataProcessor(dataPoint)
}
</script>

<template>
  <div>
    <div>
      <h1>TanStack Pacer useAsyncBatcher Example 1</h1>
      <div :style="{ marginBottom: '20px' }">
        <button @click="() => handleSearch('javascript')">
          Search "javascript"</button
        ><button
          @click="() => handleSearch('react')"
          :style="{ marginLeft: '10px' }"
        >
          Search "react"</button
        ><button
          @click="() => handleSearch('typescript')"
          :style="{ marginLeft: '10px' }"
        >
          Search "typescript"</button
        ><button
          @click="() => handleSearch('error')"
          :style="{ marginLeft: '10px' }"
        >
          Search "error" (will fail)
        </button>
      </div>
      <template v-if="isLoading"
        ><p :style="{ color: 'blue' }">Processing batch search...</p></template
      ><template v-if="displayedError"
        ><p :style="{ color: 'red' }">Error: {{ displayedError }}</p></template
      >
      <table>
        <tbody>
          <tr>
            <td>Total Searches Made:</td>
            <td>{{ searchQueries.length }}</td>
          </tr>
          <tr>
            <td>Results Found:</td>
            <td>{{ results.length }}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{{ counterBatchesProcessed }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px' }">
        <h3>Search Results:</h3>
        <div
          :style="{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="results.length === 0"
            ><p :style="{ color: '#666' }">No results yet...</p></template
          ><template v-else
            ><template v-for="(result, index) in results" :key="index"
              ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                <strong>{{ result.query }}</strong
                >: {{ result.title }}
              </div></template
            ></template
          >
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Searches are batched - max 3 queries or 2 second wait time
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncBatcher Example 2</h1>
      <div :style="{ marginBottom: '20px' }">
        <template v-for="(email, index) in sampleEmails" :key="index"
          ><button
            @click="() => validateEmail(email)"
            :style="{ marginRight: '10px', marginBottom: '5px' }"
          >
            Validate "{{ email }}"
          </button></template
        >
      </div>
      <template v-if="isValidating"
        ><p :style="{ color: 'blue' }">Validating email batch...</p></template
      >
      <table>
        <tbody>
          <tr>
            <td>Total Validations Requested:</td>
            <td>{{ emailRequests.length }}</td>
          </tr>
          <tr>
            <td>Validations Completed:</td>
            <td>{{ validationResults.length }}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{{ searchBatchesProcessed }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px' }">
        <h3>Validation Results:</h3>
        <div
          :style="{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }"
        >
          <template v-if="validationResults.length === 0"
            ><p :style="{ color: '#666' }">
              No validations completed yet...
            </p></template
          ><template v-else
            ><template v-for="(result, index) in validationResults" :key="index"
              ><div
                :style="{
                  marginBottom: '5px',
                  fontSize: '0.9em',
                  color: result.isValid ? 'green' : 'red',
                }"
              >
                <strong>{{ result.email }}</strong
                >: {{ result.message }}
              </div></template
            ></template
          >
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Email validations are batched - max 4 emails or 1.5 second wait time
      </p>
    </div>
    <hr />
    <div>
      <h1>TanStack Pacer useAsyncBatcher Example 3</h1>
      <div :style="{ marginBottom: '20px' }">
        <button @click="() => addDataPoint('sales')">Add Sales Data</button
        ><button
          @click="() => addDataPoint('marketing')"
          :style="{ marginLeft: '10px' }"
        >
          Add Marketing Data</button
        ><button
          @click="() => addDataPoint('operations')"
          :style="{ marginLeft: '10px' }"
        >
          Add Operations Data</button
        ><button
          @click="() => addDataPoint('finance')"
          :style="{ marginLeft: '10px' }"
        >
          Add Finance Data
        </button>
      </div>
      <template v-if="isProcessing"
        ><p :style="{ color: 'blue' }">Processing data batch...</p></template
      >
      <table>
        <tbody>
          <tr>
            <td>Data Points Queued:</td>
            <td>{{ dataQueue.length }}</td>
          </tr>
          <tr>
            <td>Data Points Processed:</td>
            <td>{{ processedData.length }}</td>
          </tr>
          <tr>
            <td>Batches Completed:</td>
            <td>{{ rangeBatchesProcessed }}</td>
          </tr>
        </tbody>
      </table>
      <div :style="{ marginTop: '20px', display: 'flex', gap: '20px' }">
        <div :style="{ flex: 1 }">
          <h3>Processed Data:</h3>
          <div
            :style="{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }"
          >
            <template v-if="processedData.length === 0"
              ><p :style="{ color: '#666' }">
                No data processed yet...
              </p></template
            ><template v-else
              ><template v-for="(point, index) in processedData" :key="index"
                ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                  <strong>{{ point.category }}</strong
                  >: {{ point.value }} ({{ point.id }})
                </div></template
              ></template
            >
          </div>
        </div>
        <div :style="{ flex: 1 }">
          <h3>Batch Summaries:</h3>
          <div
            :style="{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }"
          >
            <template v-if="summaries.length === 0"
              ><p :style="{ color: '#666' }">No summaries yet...</p></template
            ><template v-else
              ><template v-for="(summary, index) in summaries" :key="index"
                ><div :style="{ marginBottom: '5px', fontSize: '0.9em' }">
                  <strong>Batch {{ index + 1 }}</strong
                  >: {{ summary.totalItems }}{{ ' ' }}items, total value:
                  {{ summary.totalValue }}, categories:{{ ' '
                  }}{{ summary.categories }}
                </div></template
              ></template
            >
          </div>
        </div>
      </div>
      <p :style="{ fontSize: '0.9em', color: '#666' }">
        Data processing is batched - max 5 items or 2.5 second wait time
      </p>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
