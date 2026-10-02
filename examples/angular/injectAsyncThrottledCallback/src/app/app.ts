import { Component, signal } from '@angular/core'
import { injectAsyncThrottledCallback } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App {
  readonly search = signal('')
  readonly results = signal<Array<string>>([])
  readonly isLoading = signal(false)
  readonly error = signal('')
  readonly count = signal(0)
  readonly apiCalls = signal(0)
  private readonly searchCallback = injectAsyncThrottledCallback(
    async (query: string) => {
      if (!query.trim()) {
        this.results.set([])
        return
      }
      this.isLoading.set(true)
      this.error.set('')
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (query === 'error') throw new Error('Simulated API error')
        this.results.set([1, 2, 3].map((id) => `${query} result ${id}`))
      } finally {
        this.isLoading.set(false)
      }
    },
    {
      wait: 1000,
      throwOnError: false,
      onError: (error) => {
        this.error.set(error.message)
        this.results.set([])
      },
    },
  )
  private readonly incrementCallback = injectAsyncThrottledCallback(
    async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      this.apiCalls.update((count) => count + 1)
      this.count.set(value + 1)
      return value + 1
    },
    { wait: 1000, leading: true, trailing: true },
  )
  async onSearch(value: string): Promise<void> {
    this.search.set(value)
    await this.searchCallback(value)
  }
  async increment(): Promise<void> {
    const value = this.count() + 1
    this.count.set(value)
    await this.incrementCallback(value)
  }
  readonly scrollPosition = signal(0)
  readonly lastSavedPosition = signal(0)
  readonly saveCount = signal(0)
  readonly isSaving = signal(false)
  readonly scrollRows = Array.from({ length: 50 }, (_, index) => index + 1)
  private readonly savePosition = injectAsyncThrottledCallback(
    async (position: number) => {
      this.isSaving.set(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        this.lastSavedPosition.set(position)
        this.saveCount.update((count) => count + 1)
      } finally {
        this.isSaving.set(false)
      }
    },
    { wait: 1000, leading: true, trailing: true },
  )
  async onScroll(position: number): Promise<void> {
    this.scrollPosition.set(position)
    await this.savePosition(position)
  }
}
