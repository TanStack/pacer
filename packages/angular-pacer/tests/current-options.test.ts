import './helpers/angular'
import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it, vi } from 'vitest'
import { injectRateLimiter } from '../src/rate-limiter/injectRateLimiter'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'

it('applies current factory options before an operation, without waiting for effects', () => {
  const limit = signal(1),
    execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectRateLimiter(execute, () => ({ limit: limit(), window: 60_000 })),
  )
  TestBed.tick()
  expect(utility.maybeExecute()).toBe(true)
  limit.set(2)
  expect(utility.maybeExecute()).toBe(true)
  expect(execute).toHaveBeenCalledTimes(2)
})

it('uses the current enabled option before a leading execution', () => {
  const enabled = signal(true),
    execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(execute, () => ({
      wait: 100,
      leading: true,
      enabled: enabled(),
    })),
  )
  TestBed.tick()
  enabled.set(false)
  utility.maybeExecute()
  expect(execute).not.toHaveBeenCalled()
})
