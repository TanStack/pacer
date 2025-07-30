import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBatchedCallback } from '@tanstack/react-pacer/batcher'

interface LogEntry {
  id: number
  message: string
  timestamp: Date
}

function App1() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logCount, setLogCount] = useState(0)

  // Create batched logger function - Stable reference provided by useBatchedCallback
  const batchedLogger = useBatchedCallback(
    (entries: LogEntry[]) => {
      console.log('Processing batch of logs:', entries)
      setLogs((current) => [...current, ...entries])
    },
    {
      maxSize: 3, // Process when 3 logs collected
      wait: 2000, // Or after 2 seconds
    },
  )

  function addLog(message: string) {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
    }
    setLogCount((c) => c + 1)
    batchedLogger(newLog)
  }

  return (
    <div>
      <h1>TanStack Pacer useBatchedCallback Example 1</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => addLog(`Log entry ${logCount + 1}`)}>
          Add Log Entry
        </button>
        <button
          onClick={() => addLog(`Warning ${logCount + 1}`)}
          style={{ marginLeft: '10px' }}
        >
          Add Warning
        </button>
        <button
          onClick={() => addLog(`Error ${logCount + 1}`)}
          style={{ marginLeft: '10px' }}
        >
          Add Error
        </button>
      </div>

      <table>
        <tbody>
          <tr>
            <td>Total Logs Created:</td>
            <td>{logCount}</td>
          </tr>
          <tr>
            <td>Logs Processed:</td>
            <td>{logs.length}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <h3>Processed Logs:</h3>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {logs.length === 0 ? (
            <p style={{ color: '#666' }}>No logs processed yet...</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{ marginBottom: '5px', fontSize: '0.9em' }}
              >
                <strong>{log.timestamp.toLocaleTimeString()}</strong>:{' '}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Logs are batched - max 3 items or 2 second wait time
      </p>
    </div>
  )
}

interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}

function App2() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [batchesProcessed, setBatchesProcessed] = useState(0)

  // Create batched analytics tracker - Stable reference provided by useBatchedCallback
  const trackEvents = useBatchedCallback(
    (events: AnalyticsEvent[]) => {
      console.log('Sending analytics batch:', events)
      setEvents((current) => [...current, ...events])
      setBatchesProcessed((count) => count + 1)
    },
    {
      maxSize: 5, // Send when 5 events collected
      wait: 3000, // Or after 3 seconds
    },
  )

  function trackEvent(type: string, target: string) {
    const event: AnalyticsEvent = {
      type,
      target,
      timestamp: new Date(),
    }
    setTotalEvents((count) => count + 1)
    trackEvents(event)
  }

  return (
    <div>
      <h1>TanStack Pacer useBatchedCallback Example 2</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => trackEvent('click', 'button-1')}>
          Track Button Click
        </button>
        <button
          onClick={() => trackEvent('hover', 'card')}
          style={{ marginLeft: '10px' }}
        >
          Track Hover Event
        </button>
        <button
          onClick={() => trackEvent('view', 'page')}
          style={{ marginLeft: '10px' }}
        >
          Track Page View
        </button>
        <button
          onClick={() => trackEvent('form', 'submit')}
          style={{ marginLeft: '10px' }}
        >
          Track Form Submit
        </button>
      </div>

      <table>
        <tbody>
          <tr>
            <td>Total Events Created:</td>
            <td>{totalEvents}</td>
          </tr>
          <tr>
            <td>Events Sent:</td>
            <td>{events.length}</td>
          </tr>
          <tr>
            <td>Batches Processed:</td>
            <td>{batchesProcessed}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <h3>Sent Analytics Events:</h3>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {events.length === 0 ? (
            <p style={{ color: '#666' }}>No events sent yet...</p>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                style={{ marginBottom: '5px', fontSize: '0.9em' }}
              >
                <strong>{event.timestamp.toLocaleTimeString()}</strong>:{' '}
                {event.type} - {event.target}
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Analytics events are batched - max 5 events or 3 second wait time
      </p>
    </div>
  )
}

interface ApiRequest {
  id: string
  data: any
}

function App3() {
  const [requests, setRequests] = useState<ApiRequest[]>([])
  const [totalRequests, setTotalRequests] = useState(0)
  const [processedRequests, setProcessedRequests] = useState<ApiRequest[]>([])

  // Create batched API request handler - Stable reference provided by useBatchedCallback
  const batchApiRequests = useBatchedCallback(
    (requests: ApiRequest[]) => {
      console.log('Processing batch of API requests:', requests)
      // Simulate API processing
      setProcessedRequests((current) => [...current, ...requests])
    },
    {
      maxSize: 4, // Process when 4 requests collected
      wait: 1500, // Or after 1.5 seconds
    },
  )

  function makeApiRequest(data: any) {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    setTotalRequests((count) => count + 1)
    setRequests((current) => [...current, request])
    batchApiRequests(request)
  }

  return (
    <div>
      <h1>TanStack Pacer useBatchedCallback Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => makeApiRequest({ action: 'save', item: 'document' })}
        >
          Save Document
        </button>
        <button
          onClick={() => makeApiRequest({ action: 'update', item: 'profile' })}
          style={{ marginLeft: '10px' }}
        >
          Update Profile
        </button>
        <button
          onClick={() => makeApiRequest({ action: 'delete', item: 'file' })}
          style={{ marginLeft: '10px' }}
        >
          Delete File
        </button>
        <button
          onClick={() => makeApiRequest({ action: 'create', item: 'folder' })}
          style={{ marginLeft: '10px' }}
        >
          Create Folder
        </button>
      </div>

      <table>
        <tbody>
          <tr>
            <td>Total Requests Made:</td>
            <td>{totalRequests}</td>
          </tr>
          <tr>
            <td>Requests Queued:</td>
            <td>{requests.length - processedRequests.length}</td>
          </tr>
          <tr>
            <td>Requests Processed:</td>
            <td>{processedRequests.length}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Queued Requests:</h3>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {requests.filter(
              (req) => !processedRequests.some((p) => p.id === req.id),
            ).length === 0 ? (
              <p style={{ color: '#666' }}>No requests queued...</p>
            ) : (
              requests
                .filter(
                  (req) => !processedRequests.some((p) => p.id === req.id),
                )
                .map((request) => (
                  <div
                    key={request.id}
                    style={{ marginBottom: '5px', fontSize: '0.9em' }}
                  >
                    {request.id}: {JSON.stringify(request.data)}
                  </div>
                ))
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Processed Requests:</h3>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {processedRequests.length === 0 ? (
              <p style={{ color: '#666' }}>No requests processed yet...</p>
            ) : (
              processedRequests.map((request) => (
                <div
                  key={request.id}
                  style={{ marginBottom: '5px', fontSize: '0.9em' }}
                >
                  {request.id}: {JSON.stringify(request.data)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666' }}>
        API requests are batched - max 4 requests or 1.5 second wait time
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
