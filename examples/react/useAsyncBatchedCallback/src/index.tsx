import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAsyncBatchedCallback } from '@tanstack/react-pacer/async-batcher'

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

function App1() {
  const [searchQueries, setSearchQueries] = useState<Array<string>>([])
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batchesProcessed, setBatchesProcessed] = useState(0)

  // Create async batched search function - Stable reference provided by useAsyncBatchedCallback
  const batchedSearch = useAsyncBatchedCallback(
    async (queries: Array<string>) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await batchedSearchApi(queries)
        setResults((current) => [...current, ...data])
        setBatchesProcessed((count) => count + 1)
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    {
      maxSize: 3, // Process when 3 queries collected
      wait: 2000, // Or after 2 seconds
    },
  )

  function handleSearch(query: string) {
    if (!query.trim()) return

    setSearchQueries((current) => [...current, query])
    batchedSearch(query)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncBatchedCallback Example 1</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => handleSearch('javascript')}>
          Search "javascript"
        </button>
        <button
          onClick={() => handleSearch('react')}
          style={{ marginLeft: '10px' }}
        >
          Search "react"
        </button>
        <button
          onClick={() => handleSearch('typescript')}
          style={{ marginLeft: '10px' }}
        >
          Search "typescript"
        </button>
        <button
          onClick={() => handleSearch('error')}
          style={{ marginLeft: '10px' }}
        >
          Search "error" (will fail)
        </button>
      </div>

      {isLoading && <p style={{ color: 'blue' }}>Processing batch search...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <table>
        <tbody>
          <tr>
            <td>Total Searches Made:</td>
            <td>{searchQueries.length}</td>
          </tr>
          <tr>
            <td>Results Found:</td>
            <td>{results.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{batchesProcessed}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <h3>Search Results:</h3>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {results.length === 0 ? (
            <p style={{ color: '#666' }}>No results yet...</p>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                style={{ marginBottom: '5px', fontSize: '0.9em' }}
              >
                <strong>{result.query}</strong>: {result.title}
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Searches are batched - max 3 queries or 2 second wait time
      </p>
    </div>
  )
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

function App2() {
  const [emailRequests, setEmailRequests] = useState<
    Array<EmailValidationRequest>
  >([])
  const [validationResults, setValidationResults] = useState<
    Array<EmailValidationResult>
  >([])
  const [isValidating, setIsValidating] = useState(false)
  const [batchesProcessed, setBatchesProcessed] = useState(0)

  // Create async batched email validation function
  const batchedValidateEmail = useAsyncBatchedCallback(
    async (requests: Array<EmailValidationRequest>) => {
      setIsValidating(true)

      try {
        const results = await batchValidateEmails(requests)
        setValidationResults((current) => [...current, ...results])
        setBatchesProcessed((count) => count + 1)
        return results
      } finally {
        setIsValidating(false)
      }
    },
    {
      maxSize: 4, // Process when 4 emails collected
      wait: 1500, // Or after 1.5 seconds
    },
  )

  function validateEmail(email: string) {
    if (!email.trim()) return

    const request: EmailValidationRequest = {
      email,
      timestamp: new Date(),
    }

    setEmailRequests((current) => [...current, request])
    batchedValidateEmail(request)
  }

  const sampleEmails = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]

  return (
    <div>
      <h1>TanStack Pacer useAsyncBatchedCallback Example 2</h1>
      <div style={{ marginBottom: '20px' }}>
        {sampleEmails.map((email, index) => (
          <button
            key={index}
            onClick={() => validateEmail(email)}
            style={{ marginRight: '10px', marginBottom: '5px' }}
          >
            Validate "{email}"
          </button>
        ))}
      </div>

      {isValidating && (
        <p style={{ color: 'blue' }}>Validating email batch...</p>
      )}

      <table>
        <tbody>
          <tr>
            <td>Total Validations Requested:</td>
            <td>{emailRequests.length}</td>
          </tr>
          <tr>
            <td>Validations Completed:</td>
            <td>{validationResults.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{batchesProcessed}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <h3>Validation Results:</h3>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {validationResults.length === 0 ? (
            <p style={{ color: '#666' }}>No validations completed yet...</p>
          ) : (
            validationResults.map((result, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '5px',
                  fontSize: '0.9em',
                  color: result.isValid ? 'green' : 'red',
                }}
              >
                <strong>{result.email}</strong>: {result.message}
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Email validations are batched - max 4 emails or 1.5 second wait time
      </p>
    </div>
  )
}

interface DataPoint {
  id: string
  value: number
  category: string
}

// Simulate batched data processing API
const batchProcessData = async (
  dataPoints: Array<DataPoint>,
): Promise<{ processed: Array<DataPoint>; summary: any }> => {
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

function App3() {
  const [dataQueue, setDataQueue] = useState<Array<DataPoint>>([])
  const [processedData, setProcessedData] = useState<Array<DataPoint>>([])
  const [summaries, setSummaries] = useState<Array<any>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchesProcessed, setBatchesProcessed] = useState(0)

  // Create async batched data processor
  const batchedDataProcessor = useAsyncBatchedCallback(
    async (dataPoints: Array<DataPoint>) => {
      setIsProcessing(true)

      try {
        const result = await batchProcessData(dataPoints)
        setProcessedData((current) => [...current, ...result.processed])
        setSummaries((current) => [...current, result.summary])
        setBatchesProcessed((count) => count + 1)
        return result
      } finally {
        setIsProcessing(false)
      }
    },
    {
      maxSize: 5, // Process when 5 data points collected
      wait: 2500, // Or after 2.5 seconds
    },
  )

  function addDataPoint(category: string) {
    const dataPoint: DataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }

    setDataQueue((current) => [...current, dataPoint])
    batchedDataProcessor(dataPoint)
  }

  return (
    <div>
      <h1>TanStack Pacer useAsyncBatchedCallback Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => addDataPoint('sales')}>Add Sales Data</button>
        <button
          onClick={() => addDataPoint('marketing')}
          style={{ marginLeft: '10px' }}
        >
          Add Marketing Data
        </button>
        <button
          onClick={() => addDataPoint('operations')}
          style={{ marginLeft: '10px' }}
        >
          Add Operations Data
        </button>
        <button
          onClick={() => addDataPoint('finance')}
          style={{ marginLeft: '10px' }}
        >
          Add Finance Data
        </button>
      </div>

      {isProcessing && (
        <p style={{ color: 'blue' }}>Processing data batch...</p>
      )}

      <table>
        <tbody>
          <tr>
            <td>Data Points Queued:</td>
            <td>{dataQueue.length}</td>
          </tr>
          <tr>
            <td>Data Points Processed:</td>
            <td>{processedData.length}</td>
          </tr>
          <tr>
            <td>Batches Completed:</td>
            <td>{batchesProcessed}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Processed Data:</h3>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {processedData.length === 0 ? (
              <p style={{ color: '#666' }}>No data processed yet...</p>
            ) : (
              processedData.map((point) => (
                <div
                  key={point.id}
                  style={{ marginBottom: '5px', fontSize: '0.9em' }}
                >
                  <strong>{point.category}</strong>: {point.value} ({point.id})
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Batch Summaries:</h3>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {summaries.length === 0 ? (
              <p style={{ color: '#666' }}>No summaries yet...</p>
            ) : (
              summaries.map((summary, index) => (
                <div
                  key={index}
                  style={{ marginBottom: '5px', fontSize: '0.9em' }}
                >
                  <strong>Batch {index + 1}</strong>: {summary.totalItems}{' '}
                  items, total value: {summary.totalValue}, categories:{' '}
                  {summary.categories}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Data processing is batched - max 5 items or 2.5 second wait time
      </p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
)
