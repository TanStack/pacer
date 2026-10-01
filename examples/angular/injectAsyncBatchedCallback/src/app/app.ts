import { Component, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { injectAsyncBatchedCallback } from '@tanstack/angular-pacer'

type SearchResult = { title: string; query: string }
type EmailResult = { email: string; isValid: boolean; message: string }
type DataPoint = { id: number; value: number; category: string }
type Summary = { totalItems: number; totalValue: number; categories: number }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly queries = signal<Array<string>>([])
  readonly results = signal<Array<SearchResult>>([])
  readonly isSearching = signal(false)
  readonly searchError = signal('')
  readonly searchBatches = signal(0)
  readonly emails = signal<Array<string>>([])
  readonly validations = signal<Array<EmailResult>>([])
  readonly isValidating = signal(false)
  readonly validationBatches = signal(0)
  readonly points = signal<Array<DataPoint>>([])
  readonly processed = signal<Array<DataPoint>>([])
  readonly summaries = signal<Array<Summary>>([])
  readonly isProcessing = signal(false)
  readonly searchChoices = ['javascript', 'react', 'typescript', 'error']
  readonly emailChoices = [
    'user@example.com',
    'invalid-email',
    'test@domain.org',
    'bad@email',
    'good@test.com',
  ]
  readonly categories = ['sales', 'marketing', 'operations', 'finance']
  readonly searchBatch = injectAsyncBatchedCallback(
    async (queries: Array<string>) => {
      this.isSearching.set(true)
      this.searchError.set('')
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (queries.includes('error'))
          throw new Error('Simulated batch API error')
        const results = queries.flatMap((query) =>
          [1, 2].map((id) => ({ query, title: `${query} result ${id}` })),
        )
        this.results.update((previous) => [...previous, ...results])
        this.searchBatches.update((count) => count + 1)
        return results
      } finally {
        this.isSearching.set(false)
      }
    },
    {
      maxSize: 3,
      wait: 2000,
      throwOnError: false,
      onError: (error) => this.searchError.set(error.message),
    },
  )
  readonly emailBatch = injectAsyncBatchedCallback(
    async (emails: Array<string>) => {
      this.isValidating.set(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 600))
        const results = emails.map((email) => {
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          return {
            email,
            isValid,
            message: isValid ? 'Email is valid!' : 'Invalid email format',
          }
        })
        this.validations.update((previous) => [...previous, ...results])
        this.validationBatches.update((count) => count + 1)
        return results
      } finally {
        this.isValidating.set(false)
      }
    },
    { maxSize: 4, wait: 1500 },
  )
  readonly dataBatch = injectAsyncBatchedCallback(
    async (points: Array<DataPoint>) => {
      this.isProcessing.set(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const processed = points.map((point) => ({
          ...point,
          value: point.value * 2,
        }))
        const summary = {
          totalItems: processed.length,
          totalValue: processed.reduce((sum, point) => sum + point.value, 0),
          categories: new Set(processed.map((point) => point.category)).size,
        }
        this.processed.update((previous) => [...previous, ...processed])
        this.summaries.update((previous) => [...previous, summary])
        return { processed, summary }
      } finally {
        this.isProcessing.set(false)
      }
    },
    { maxSize: 5, wait: 2500 },
  )
  async addSearch(query: string): Promise<void> {
    this.queries.update((previous) => [...previous, query])
    await this.searchBatch(query)
  }
  async addEmail(email: string): Promise<void> {
    this.emails.update((previous) => [...previous, email])
    await this.emailBatch(email)
  }
  async addData(category: string): Promise<void> {
    const point = {
      id: this.points().length + 1,
      value: Math.floor(Math.random() * 100) + 1,
      category,
    }
    this.points.update((previous) => [...previous, point])
    await this.dataBatch(point)
  }
}
