import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
interface SearchResult {
  id: number
  title: string
  query: string
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
interface DataPoint {
  id: string
  value: number
  category: string
}
class Counter {
  private scope = createPacerScope()
  async batchedSearchApi(queries: Array<string>): Promise<Array<SearchResult>> {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
    if (queries.some((q) => q === 'error')) {
      throw new Error('Simulated batch API error')
    }
    return queries.flatMap((query, index) => [
      { id: index * 10 + 1, title: `${query} result 1`, query },
      { id: index * 10 + 2, title: `${query} result 2`, query },
    ])
  }
  searchQueries: Array<string> = []
  results: Array<SearchResult> = []
  isLoading = false
  displayedError: string | null = null
  batchesProcessed = 0
  batchedSearch!: ReturnType<Counter['makeBatchedSearch']>
  makeBatchedSearch() {
    return this.scope.createAsyncBatchedCallback(
      async (queries: Array<string>) => {
        this.isLoading = true
        this.displayedError = null
        try {
          const data = await this.batchedSearchApi(queries)
          this.results = [...this.results, ...data]
          this.batchesProcessed = this.batchesProcessed + 1
          return data
        } finally {
          this.isLoading = false
        }
      },
      () => ({
        maxSize: 3, // Process when 3 queries collected
        wait: 2000, // Or after 2 seconds
        throwOnError: false,
        onError: (error) => {
          this.displayedError =
            error instanceof Error ? error.message : 'Unknown error'
        },
      }),
    )
  }
  handleSearch(query: string) {
    if (!query.trim()) return
    this.searchQueries = [...this.searchQueries, query]
    this.batchedSearch(query)
  }
  init() {
    this.batchedSearch = this.makeBatchedSearch()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  async batchValidateEmails(
    requests: Array<EmailValidationRequest>,
  ): Promise<Array<EmailValidationResult>> {
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
  emailRequests: Array<EmailValidationRequest> = []
  validationResults: Array<EmailValidationResult> = []
  isValidating = false
  batchesProcessed = 0
  batchedValidateEmail!: ReturnType<Search['makeBatchedValidateEmail']>
  makeBatchedValidateEmail() {
    return this.scope.createAsyncBatchedCallback(
      async (requests: Array<EmailValidationRequest>) => {
        this.isValidating = true
        try {
          const results = await this.batchValidateEmails(requests)
          this.validationResults = [...this.validationResults, ...results]
          this.batchesProcessed = this.batchesProcessed + 1
          return results
        } finally {
          this.isValidating = false
        }
      },
      () => ({
        maxSize: 4, // Process when 4 emails collected
        wait: 1500, // Or after 1.5 seconds
      }),
    )
  }
  validateEmail(email: string) {
    if (!email.trim()) return
    const request: EmailValidationRequest = {
      email,
      timestamp: new Date(),
    }
    this.emailRequests = [...this.emailRequests, request]
    this.batchedValidateEmail(request)
  }
  sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
  init() {
    this.batchedValidateEmail = this.makeBatchedValidateEmail()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  async batchProcessData(dataPoints: Array<DataPoint>): Promise<{
    processed: Array<DataPoint>
    summary: any
  }> {
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
  dataQueue: Array<DataPoint> = []
  processedData: Array<DataPoint> = []
  summaries: Array<any> = []
  isProcessing = false
  batchesProcessed = 0
  batchedDataProcessor!: ReturnType<Range['makeBatchedDataProcessor']>
  makeBatchedDataProcessor() {
    return this.scope.createAsyncBatchedCallback(
      async (dataPoints: Array<DataPoint>) => {
        this.isProcessing = true
        try {
          const result = await this.batchProcessData(dataPoints)
          this.processedData = [...this.processedData, ...result.processed]
          this.summaries = [...this.summaries, result.summary]
          this.batchesProcessed = this.batchesProcessed + 1
          return result
        } finally {
          this.isProcessing = false
        }
      },
      () => ({
        maxSize: 5, // Process when 5 data points collected
        wait: 2500, // Or after 2.5 seconds
      }),
    )
  }
  addDataPoint(category: string) {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    this.dataQueue = [...this.dataQueue, dataPoint]
    this.batchedDataProcessor(dataPoint)
  }
  init() {
    this.batchedDataProcessor = this.makeBatchedDataProcessor()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('range', () => new Range())

Alpine.data('devtools', () => {
  let host: TanStackDevtoolsCore | undefined
  let target: HTMLDivElement | undefined
  return {
    init() {
      if (!import.meta.env.DEV) return
      target = document.createElement('div')
      document.body.append(target)
      host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
      host.mount(target)
    },
    destroy() {
      host?.unmount()
      target?.remove()
    },
  }
})
Alpine.start()
