import { Component, computed, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectBatchedCallback } from '@tanstack/angular-pacer'

type LogEntry = { id: number; message: string; timestamp: string }
type AnalyticsEvent = { type: string; target: string; timestamp: string }
type ApiRequest = { id: number; data: { action: string; item: string } }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly logs = signal<Array<LogEntry>>([])
  readonly logCount = signal(0)
  readonly events = signal<Array<AnalyticsEvent>>([])
  readonly totalEvents = signal(0)
  readonly batchesProcessed = signal(0)
  readonly requests = signal<Array<ApiRequest>>([])
  readonly processedRequests = signal<Array<ApiRequest>>([])
  readonly pendingRequests = computed(() =>
    this.requests().filter(
      (request) => !this.processedRequests().some((processed) => processed.id === request.id),
    ),
  )
  private readonly logger = injectBatchedCallback(
    (entries: Array<LogEntry>) => this.logs.update((logs) => [...logs, ...entries]),
    { maxSize: 3, wait: 2000 },
  )
  private readonly tracker = injectBatchedCallback(
    (events: Array<AnalyticsEvent>) => {
      this.events.update((previous) => [...previous, ...events])
      this.batchesProcessed.update((count) => count + 1)
    },
    { maxSize: 5, wait: 3000 },
  )
  private readonly requestBatch = injectBatchedCallback(
    (requests: Array<ApiRequest>) =>
      this.processedRequests.update((previous) => [...previous, ...requests]),
    { maxSize: 4, wait: 1500 },
  )
  addLog(kind: string): void {
    this.logCount.update((count) => count + 1)
    this.logger({
      id: this.logCount(),
      message: `${kind} ${this.logCount()}`,
      timestamp: new Date().toLocaleTimeString(),
    })
  }
  trackEvent(type: string, target: string): void {
    this.totalEvents.update((count) => count + 1)
    this.tracker({ type, target, timestamp: new Date().toLocaleTimeString() })
  }
  makeRequest(action: string, item: string): void {
    const request = { id: this.requests().length + 1, data: { action, item } }
    this.requests.update((requests) => [...requests, request])
    this.requestBatch(request)
  }
}
