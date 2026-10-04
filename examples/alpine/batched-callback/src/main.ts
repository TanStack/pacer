import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
interface LogEntry {
  id: number
  message: string
  timestamp: Date
}
interface AnalyticsEvent {
  type: string
  target: string
  timestamp: Date
}
interface ApiRequest {
  id: string
  data: any
}
class Counter {
  private scope = createPacerScope()
  logs: LogEntry[] = []
  logCount = 0
  batchedLogger!: ReturnType<Counter['makeBatchedLogger']>
  makeBatchedLogger() {
    return this.scope.createBatcher(
      (entries: LogEntry[]) => {
        console.log('Processing batch of logs:', entries)
        this.logs = [...this.logs, ...entries]
      },
      () => ({
        maxSize: 3, // Process when 3 logs collected
        wait: 2000, // Or after 2 seconds
      }),
    ).addItem
  }
  addLog(message: string) {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
    }
    this.logCount = this.logCount + 1
    this.batchedLogger(newLog)
  }
  init() {
    this.batchedLogger = this.makeBatchedLogger()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('counter', () => new Counter())

class Search {
  private scope = createPacerScope()
  eventHistory: AnalyticsEvent[] = []
  totalEvents = 0
  batchesProcessed = 0
  trackEvents!: ReturnType<Search['makeTrackEvents']>
  makeTrackEvents() {
    return this.scope.createBatcher(
      (events: AnalyticsEvent[]) => {
        console.log('Sending analytics batch:', events)
        this.eventHistory = [...this.eventHistory, ...events]
        this.batchesProcessed = this.batchesProcessed + 1
      },
      () => ({
        maxSize: 5, // Send when 5 events collected
        wait: 3000, // Or after 3 seconds
      }),
    ).addItem
  }
  trackEvent(type: string, target: string) {
    const event: AnalyticsEvent = {
      type,
      target,
      timestamp: new Date(),
    }
    this.totalEvents = this.totalEvents + 1
    this.trackEvents(event)
  }
  init() {
    this.trackEvents = this.makeTrackEvents()
  }
  destroy() {
    this.scope.destroy()
  }
}
Alpine.data('search', () => new Search())

class Range {
  private scope = createPacerScope()
  requestHistory: ApiRequest[] = []
  totalRequests = 0
  processedRequests: ApiRequest[] = []
  batchApiRequests!: ReturnType<Range['makeBatchApiRequests']>
  makeBatchApiRequests() {
    return this.scope.createBatcher(
      (requests: ApiRequest[]) => {
        console.log('Processing batch of API requests:', requests)
        // Simulate API processing
        this.processedRequests = [...this.processedRequests, ...requests]
      },
      () => ({
        maxSize: 4, // Process when 4 requests collected
        wait: 1500, // Or after 1.5 seconds
      }),
    ).addItem
  }
  makeApiRequest(data: any) {
    const request: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
    }
    this.totalRequests = this.totalRequests + 1
    this.requestHistory = [...this.requestHistory, request]
    this.batchApiRequests(request)
  }
  init() {
    this.batchApiRequests = this.makeBatchApiRequests()
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
