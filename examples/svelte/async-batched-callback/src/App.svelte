<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createAsyncBatcher } from '@tanstack/svelte-pacer/async-batcher'

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
  let searchQueries = $state<Array<string>>([])

  let results = $state<Array<SearchResult>>([])

  let isLoading = $state(false)

  let displayedError = $state<string | null>(null)

  let counterBatchesProcessed = $state(0)

  const batchedSearch = createAsyncBatcher(
    async (queries: Array<string>) => {
      isLoading = true
      displayedError = null
      try {
        const data = await batchedSearchApi(queries)
        results = [...results, ...data]
        counterBatchesProcessed = counterBatchesProcessed + 1
        return data
      } finally {
        isLoading = false
      }
    },
    () => ({
      maxSize: 3, // Process when 3 queries collected
      wait: 2000, // Or after 2 seconds
      throwOnError: false,
      onError: (error) => {
        displayedError =
          error instanceof Error ? error.message : 'Unknown error'
      },
    }),
  ).addItem

  function handleSearch(query: string) {
    if (!query.trim()) return
    searchQueries = [...searchQueries, query]
    batchedSearch(query)
  }

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
  let dataQueue = $state<Array<DataPoint>>([])

  let processedData = $state<Array<DataPoint>>([])

  let summaries = $state<Array<any>>([])

  let isProcessing = $state(false)

  let rangeBatchesProcessed = $state(0)

  const batchedDataProcessor = createAsyncBatcher(
    async (dataPoints: Array<DataPoint>) => {
      isProcessing = true
      try {
        const result = await batchProcessData(dataPoints)
        processedData = [...processedData, ...result.processed]
        summaries = [...summaries, result.summary]
        rangeBatchesProcessed = rangeBatchesProcessed + 1
        return result
      } finally {
        isProcessing = false
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
    dataQueue = [...dataQueue, dataPoint]
    batchedDataProcessor(dataPoint)
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
  let emailRequests = $state<Array<EmailValidationRequest>>([])

  let validationResults = $state<Array<EmailValidationResult>>([])

  let isValidating = $state(false)

  let searchBatchesProcessed = $state(0)

  const batchedValidateEmail = createAsyncBatcher(
    async (requests: Array<EmailValidationRequest>) => {
      isValidating = true
      try {
        const results = await batchValidateEmails(requests)
        validationResults = [...validationResults, ...results]
        searchBatchesProcessed = searchBatchesProcessed + 1
        return results
      } finally {
        isValidating = false
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
    emailRequests = [...emailRequests, request]
    batchedValidateEmail(request)
  }

  const sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
</script>

<div>
  <div>
    <h1>TanStack Pacer createAsyncBatcher Example 1</h1>
    <div style="margin-bottom: 20px">
      <button onclick={() => handleSearch('javascript')}>
        Search "javascript"</button
      ><button onclick={() => handleSearch('react')} style="margin-left: 10px">
        Search "react"</button
      ><button
        onclick={() => handleSearch('typescript')}
        style="margin-left: 10px"
      >
        Search "typescript"</button
      ><button onclick={() => handleSearch('error')} style="margin-left: 10px">
        Search "error" (will fail)
      </button>
    </div>
    {#if isLoading}<p style="color: blue">
        Processing batch search...
      </p>{/if}{#if displayedError}<p style="color: red">
        Error: {displayedError}
      </p>{/if}
    <table>
      <tbody
        ><tr><td>Total Searches Made:</td><td>{searchQueries.length}</td></tr
        ><tr><td>Results Found:</td><td>{results.length}</td></tr><tr
          ><td>Batches Processed:</td><td>{counterBatchesProcessed}</td></tr
        ></tbody
      >
    </table>
    <div style="margin-top: 20px">
      <h3>Search Results:</h3>
      <div
        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if results.length === 0}<p style="color: #666">
            No results yet...
          </p>{:else}{#each results as result, index (index)}<div
              style="margin-bottom: 5px; font-size: 0.9em"
            >
              <strong>{result.query}</strong>: {result.title}
            </div>{/each}{/if}
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Searches are batched - max 3 queries or 2 second wait time
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createAsyncBatcher Example 2</h1>
    <div style="margin-bottom: 20px">
      {#each sampleEmails as email, index (index)}<button
          onclick={() => validateEmail(email)}
          style="margin-right: 10px; margin-bottom: 5px"
        >
          Validate "{email}"
        </button>{/each}
    </div>
    {#if isValidating}<p style="color: blue">Validating email batch...</p>{/if}
    <table>
      <tbody
        ><tr
          ><td>Total Validations Requested:</td><td>{emailRequests.length}</td
          ></tr
        ><tr
          ><td>Validations Completed:</td><td>{validationResults.length}</td
          ></tr
        ><tr><td>Batches Processed:</td><td>{searchBatchesProcessed}</td></tr
        ></tbody
      >
    </table>
    <div style="margin-top: 20px">
      <h3>Validation Results:</h3>
      <div
        style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
      >
        {#if validationResults.length === 0}<p style="color: #666">
            No validations completed yet...
          </p>{:else}{#each validationResults as result, index (index)}<div
              style={`margin-bottom: 5px; font-size: 0.9em; color: ${result.isValid ? 'green' : 'red'}`}
            >
              <strong>{result.email}</strong>: {result.message}
            </div>{/each}{/if}
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Email validations are batched - max 4 emails or 1.5 second wait time
    </p>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createAsyncBatcher Example 3</h1>
    <div style="margin-bottom: 20px">
      <button onclick={() => addDataPoint('sales')}>Add Sales Data</button
      ><button
        onclick={() => addDataPoint('marketing')}
        style="margin-left: 10px"
      >
        Add Marketing Data</button
      ><button
        onclick={() => addDataPoint('operations')}
        style="margin-left: 10px"
      >
        Add Operations Data</button
      ><button
        onclick={() => addDataPoint('finance')}
        style="margin-left: 10px"
      >
        Add Finance Data
      </button>
    </div>
    {#if isProcessing}<p style="color: blue">Processing data batch...</p>{/if}
    <table>
      <tbody
        ><tr><td>Data Points Queued:</td><td>{dataQueue.length}</td></tr><tr
          ><td>Data Points Processed:</td><td>{processedData.length}</td></tr
        ><tr><td>Batches Completed:</td><td>{rangeBatchesProcessed}</td></tr
        ></tbody
      >
    </table>
    <div style="margin-top: 20px; display: flex; gap: 20px">
      <div style="flex: 1">
        <h3>Processed Data:</h3>
        <div
          style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
        >
          {#if processedData.length === 0}<p style="color: #666">
              No data processed yet...
            </p>{:else}{#each processedData as point, index (index)}<div
                style="margin-bottom: 5px; font-size: 0.9em"
              >
                <strong>{point.category}</strong>: {point.value} ({point.id})
              </div>{/each}{/if}
        </div>
      </div>
      <div style="flex: 1">
        <h3>Batch Summaries:</h3>
        <div
          style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px"
        >
          {#if summaries.length === 0}<p style="color: #666">
              No summaries yet...
            </p>{:else}{#each summaries as summary, index (index)}<div
                style="margin-bottom: 5px; font-size: 0.9em"
              >
                <strong>Batch {index + 1}</strong>: {summary.totalItems}{' '}items,
                total value: {summary.totalValue}, categories:{' '}{summary.categories}
              </div>{/each}{/if}
        </div>
      </div>
    </div>
    <p style="font-size: 0.9em; color: #666">
      Data processing is batched - max 5 items or 2.5 second wait time
    </p>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
