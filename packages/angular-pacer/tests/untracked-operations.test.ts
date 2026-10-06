import './helpers/angular'
import { effect, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it, vi } from 'vitest'
import { injectRateLimiter } from '../src/rate-limiter/injectRateLimiter'
import { injectDebouncedValue } from '../src/debouncer/injectDebouncedValue'

it('does not subscribe consumer effects to callback signal reads', () => {
  const query = signal('hello'),
    audit = signal(false),
    persist = vi.fn()
  TestBed.runInInjectionContext(() => {
    const utility = injectRateLimiter(
      (value: string) => {
        persist(value, audit())
      },
      { limit: 100, window: 1000 },
    )
    effect(() => utility.maybeExecute(query()))
  })
  TestBed.tick()
  audit.set(true)
  TestBed.tick()
  expect(persist).toHaveBeenCalledTimes(1)
  query.set('next')
  TestBed.tick()
  expect(persist).toHaveBeenCalledTimes(2)
})

it('does not rerun value synchronization for function-valued option reads', () => {
  const source = signal('hello'),
    wait = signal(100),
    readWait = vi.fn(() => wait())
  TestBed.runInInjectionContext(() =>
    injectDebouncedValue(source, { wait: readWait }),
  )
  TestBed.tick()
  const calls = readWait.mock.calls.length
  wait.set(200)
  TestBed.tick()
  expect(readWait).toHaveBeenCalledTimes(calls)
})
