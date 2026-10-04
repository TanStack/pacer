import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncBatcher } from '@tanstack/ember-pacer'
import type { EmberAsyncBatcherOptions } from '@tanstack/ember-pacer'
import { htmlSafe } from '@ember/template'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'

interface SearchResult {
  id: number
  title: string
  query: string
}
type CounterExecute = Counter['execute']
type CounterUtility = (item: Parameters<CounterExecute>[0][number]) => unknown
const counterEq = (a: unknown, b: unknown) => a === b
class Counter extends Component {
  batchedSearchApi = async (
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
  @tracked searchQueries: Array<string> = []
  @tracked results: Array<SearchResult> = []
  @tracked isLoading = false
  @tracked displayedError: string | null = null
  @tracked batchesProcessed = 0
  handleSearch = (utility: CounterUtility, query: string) => {
    if (!query.trim()) return
    this.searchQueries = [...this.searchQueries, query]
    utility(query)
  }
  execute = async (queries: Array<string>) => {
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
  }
  onErrorOption: NonNullable<
    EmberAsyncBatcherOptions<Parameters<CounterExecute>[0][number]>['onError']
  > = (error) => {
    this.displayedError =
      error instanceof Error ? error.message : 'Unknown error'
  }
  searchJavascript = (utility: CounterUtility) => {
    this.handleSearch(utility, 'javascript')
  }
  searchReact = (utility: CounterUtility) => {
    this.handleSearch(utility, 'react')
  }
  searchTypescript = (utility: CounterUtility) => {
    this.handleSearch(utility, 'typescript')
  }
  searchError = (utility: CounterUtility) => {
    this.handleSearch(utility, 'error')
  }
  <template>
    {{#let
      (useAsyncBatcher
        this.execute
        maxSize=3
        wait=2000
        throwOnError=false
        onError=this.onErrorOption
      )
      as |batchedSearch|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 1</h1><div
          style='margin-bottom: 20px'
        ><button
            {{on 'click' (fn this.searchJavascript batchedSearch.addItem)}}
          >
            Search "javascript"</button><button
            {{on 'click' (fn this.searchReact batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "react"</button><button
            {{on 'click' (fn this.searchTypescript batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "typescript"</button><button
            {{on 'click' (fn this.searchError batchedSearch.addItem)}}
            style='margin-left: 10px'
          > Search "error" (will fail) </button></div>{{#if this.isLoading}}<p
            style='color: blue'
          >Processing batch search...</p>{{/if}}{{#if this.displayedError}}<p
            style='color: red'
          >Error: {{this.displayedError}}</p>{{/if}}<table><tbody><tr><td>Total
                Searches Made:</td><td
              >{{this.searchQueries.length}}</td></tr><tr><td>Results Found:</td><td
              >{{this.results.length}}</td></tr><tr><td>Batches Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Search Results:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (counterEq this.results.length 0)}}<p style='color: #666'>No
                results yet...</p>{{else}}{{#each
                this.results
                as |result index|
              }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong
                  >{{result.query}}</strong>:
                  {{result.title}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Searches are batched - max 3 queries or 2 second wait time
        </p></div>{{/let}}
  </template>
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
type SearchExecute = Search['execute']
type SearchUtility = (item: Parameters<SearchExecute>[0][number]) => unknown
const searchEq = (a: unknown, b: unknown) => a === b
class Search extends Component {
  batchValidateEmails = async (
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
  @tracked emailRequests: Array<EmailValidationRequest> = []
  @tracked validationResults: Array<EmailValidationResult> = []
  @tracked isValidating = false
  @tracked batchesProcessed = 0
  validateEmail = (utility: SearchUtility, email: string) => {
    if (!email.trim()) return
    const request: EmailValidationRequest = {
      email,
      timestamp: new Date(),
    }
    this.emailRequests = [...this.emailRequests, request]
    utility(request)
  }
  sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
  execute = async (requests: Array<EmailValidationRequest>) => {
    this.isValidating = true
    try {
      const results = await this.batchValidateEmails(requests)
      this.validationResults = [...this.validationResults, ...results]
      this.batchesProcessed = this.batchesProcessed + 1
      return results
    } finally {
      this.isValidating = false
    }
  }
  validationStyle = (result: EmailValidationResult) => {
    const styles = {
      marginBottom: '5px',
      fontSize: '0.9em',
      color: result.isValid ? 'green' : 'red',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  <template>
    {{#let
      (useAsyncBatcher this.execute maxSize=4 wait=1500)
      as |batchedValidateEmail|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 2</h1><div
          style='margin-bottom: 20px'
        >{{#each this.sampleEmails as |email index|}}<button
              {{on
                'click'
                (fn this.validateEmail batchedValidateEmail.addItem email)
              }}
              style='margin-right: 10px; margin-bottom: 5px'
            > Validate "{{email}}" </button>{{/each}}</div>{{#if
          this.isValidating
        }}<p style='color: blue'>Validating email batch...</p>{{/if}}<table
        ><tbody><tr><td>Total Validations Requested:</td><td
              >{{this.emailRequests.length}}</td></tr><tr><td>Validations
                Completed:</td><td
              >{{this.validationResults.length}}</td></tr><tr><td>Batches
                Processed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px'
        ><h3>Validation Results:</h3><div
            style='max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
          >{{#if (searchEq this.validationResults.length 0)}}<p
                style='color: #666'
              >
                No validations completed yet...
              </p>{{else}}{{#each this.validationResults as |result index|}}<div
                  style={{this.validationStyle result}}
                ><strong>{{result.email}}</strong>:
                  {{result.message}}</div>{{/each}}{{/if}}</div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Email validations are batched - max 4 emails or 1.5 second wait time
        </p></div>{{/let}}
  </template>
}

interface DataPoint {
  id: string
  value: number
  category: string
}
type RangeExecute = Range['execute']
type RangeUtility = (item: Parameters<RangeExecute>[0][number]) => unknown
const rangeEq = (a: unknown, b: unknown) => a === b
const add = (a: number, b: number) => a + b
const space = ' '
class Range extends Component {
  batchProcessData = async (
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
  @tracked dataQueue: Array<DataPoint> = []
  @tracked processedData: Array<DataPoint> = []
  @tracked summaries: Array<any> = []
  @tracked isProcessing = false
  @tracked batchesProcessed = 0
  addDataPoint = (utility: RangeUtility, category: string) => {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    this.dataQueue = [...this.dataQueue, dataPoint]
    utility(dataPoint)
  }
  execute = async (dataPoints: Array<DataPoint>) => {
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
  }
  addSalesData = (utility: RangeUtility) => {
    this.addDataPoint(utility, 'sales')
  }
  addMarketingData = (utility: RangeUtility) => {
    this.addDataPoint(utility, 'marketing')
  }
  addOperationsData = (utility: RangeUtility) => {
    this.addDataPoint(utility, 'operations')
  }
  addFinanceData = (utility: RangeUtility) => {
    this.addDataPoint(utility, 'finance')
  }
  <template>
    {{#let
      (useAsyncBatcher this.execute maxSize=5 wait=2500)
      as |batchedDataProcessor|
    }}<div><h1>TanStack Pacer useAsyncBatcher Example 3</h1><div
          style='margin-bottom: 20px'
        ><button
            {{on 'click' (fn this.addSalesData batchedDataProcessor.addItem)}}
          >Add Sales Data</button><button
            {{on
              'click'
              (fn this.addMarketingData batchedDataProcessor.addItem)
            }}
            style='margin-left: 10px'
          > Add Marketing Data</button><button
            {{on
              'click'
              (fn this.addOperationsData batchedDataProcessor.addItem)
            }}
            style='margin-left: 10px'
          > Add Operations Data</button><button
            {{on 'click' (fn this.addFinanceData batchedDataProcessor.addItem)}}
            style='margin-left: 10px'
          > Add Finance Data </button></div>{{#if this.isProcessing}}<p
            style='color: blue'
          >Processing data batch...</p>{{/if}}<table><tbody><tr><td>Data Points
                Queued:</td><td>{{this.dataQueue.length}}</td></tr><tr><td>Data
                Points Processed:</td><td
              >{{this.processedData.length}}</td></tr><tr><td>Batches Completed:</td><td
              >{{this.batchesProcessed}}</td></tr></tbody></table><div
          style='margin-top: 20px; display: flex; gap: 20px'
        ><div style='flex: 1'><h3>Processed Data:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (rangeEq this.processedData.length 0)}}<p
                  style='color: #666'
                >
                  No data processed yet...
                </p>{{else}}{{#each this.processedData as |point index|}}<div
                    style='margin-bottom: 5px; font-size: 0.9em'
                  ><strong>{{point.category}}</strong>:
                    {{point.value}}
                    ({{point.id}})
                  </div>{{/each}}{{/if}}</div></div><div style='flex: 1'><h3
            >Batch Summaries:</h3><div
              style='max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px'
            >{{#if (rangeEq this.summaries.length 0)}}<p style='color: #666'>No
                  summaries yet...</p>{{else}}{{#each
                  this.summaries
                  as |summary index|
                }}<div style='margin-bottom: 5px; font-size: 0.9em'><strong
                    >Batch {{add index 1}}</strong>:
                    {{summary.totalItems}}{{space}}items, total value:
                    {{summary.totalValue}}, categories:{{space}}{{summary.categories}}</div>{{/each}}{{/if}}</div></div></div><p
          style='font-size: 0.9em; color: #666'
        >
          Data processing is batched - max 5 items or 2.5 second wait time
        </p></div>{{/let}}
  </template>
}

export default class Application extends Component {
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    <div><Counter /><hr /><Search /><hr /><Range /></div>
  </template>
}
