import { Component, signal } from '@angular/core'
import { injectAsyncDebouncedCallback } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App {
  readonly search = signal('')
  readonly results = signal<Array<string>>([])
  readonly isLoading = signal(false)
  readonly error = signal('')
  readonly count = signal(0)
  readonly apiCalls = signal(0)
  private readonly searchCallback = injectAsyncDebouncedCallback(
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
      wait: 500,
      throwOnError: false,
      onError: (error) => {
        this.error.set(error.message)
        this.results.set([])
      },
    },
  )
  private readonly incrementCallback = injectAsyncDebouncedCallback(
    async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      this.apiCalls.update((count) => count + 1)
      this.count.set(value + 1)
      return value + 1
    },
    { wait: 1000, leading: false, trailing: true },
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
  readonly email = signal('')
  readonly validation = signal<{ isValid: boolean; message: string } | null>(
    null,
  )
  readonly isValidating = signal(false)
  private readonly validate = injectAsyncDebouncedCallback(
    async (email: string) => {
      if (!email.trim()) {
        this.validation.set(null)
        return
      }
      this.isValidating.set(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        this.validation.set({
          isValid,
          message: isValid
            ? 'Email is valid!'
            : 'Please enter a valid email address',
        })
      } finally {
        this.isValidating.set(false)
      }
    },
    { wait: 750, leading: false },
  )
  async onEmail(value: string): Promise<void> {
    this.email.set(value)
    await this.validate(value)
  }
}
