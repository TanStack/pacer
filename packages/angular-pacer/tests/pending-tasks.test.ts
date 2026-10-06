import './helpers/angular'
import {
  ApplicationRef,
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it, vi } from 'vitest'
import { injectAsyncQueuer } from '../src/async-queuer/injectAsyncQueuer'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectAsyncDebouncer } from '../src/async-debouncer/injectAsyncDebouncer'

it('keeps zoneless stability pending until an asynchronous result is applied', async () => {
  let resolve!: (value: string) => void
  const result = signal('loading')
  const response = new Promise<string>((done) => {
    resolve = done
  })
  const loader = TestBed.runInInjectionContext(() =>
    injectAsyncDebouncer(
      async () => {
        result.set(await response)
        return result()
      },
      { wait: 0, leading: true },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  await app.whenStable()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  const execution = loader.maybeExecute()
  const stability = app.whenStable()
  try {
    expect(stable).toBe(false)
  } finally {
    resolve('loaded')
    await execution
    await stability
    subscription.unsubscribe()
  }
  expect(result()).toBe('loaded')
})

it('owns overlapping executions even after reset clears displayed state', async () => {
  const resolvers: Array<(value: string) => void> = []
  const loader = TestBed.runInInjectionContext(() =>
    injectAsyncDebouncer(
      () => new Promise<string>((resolve) => resolvers.push(resolve)),
      { wait: 0, leading: true },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  await app.whenStable()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  const first = loader.maybeExecute()
  loader.reset()
  const second = loader.maybeExecute()
  expect(resolvers).toHaveLength(2)
  try {
    resolvers[1]!('second')
    await second
    await Promise.resolve()
    expect(stable).toBe(false)
  } finally {
    resolvers[0]!('first')
    await first
    await app.whenStable()
    subscription.unsubscribe()
  }
})

it('awaits automatic queue processing and core result callbacks', async () => {
  let resolve!: (value: string) => void
  let applied = ''
  TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(
      () =>
        new Promise<string>((done) => {
          resolve = done
        }),
      {
        initialItems: ['item'],
        onSuccess: (value) => {
          applied = value
        },
      },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  const stability = app.whenStable()
  try {
    expect(stable).toBe(false)
  } finally {
    resolve('loaded')
    await stability
    subscription.unsubscribe()
  }
  expect(applied).toBe('loaded')
})

it('releases canceled scheduled work started before effects connect', async () => {
  const execute = vi.fn()
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(execute, { wait: 60_000 }),
  )
  const app = TestBed.inject(ApplicationRef)
  utility.maybeExecute()
  utility.cancel()
  TestBed.tick()
  await app.whenStable()
  expect(execute).not.toHaveBeenCalled()
})

it('preserves awaited errors and releases tasks after failure', async () => {
  const error = new Error('request failed')
  const loader = TestBed.runInInjectionContext(() =>
    injectAsyncDebouncer(
      async () => {
        throw error
      },
      { wait: 0, leading: true },
    ),
  )
  await expect(loader.maybeExecute()).rejects.toBe(error)
  TestBed.tick()
  await TestBed.inject(ApplicationRef).whenStable()
})

it('keeps automatic queue retry waits pending until they finish or are aborted', async () => {
  let retryStarted!: () => void
  const retry = new Promise<void>((resolve) => {
    retryStarted = resolve
  })
  const queue = TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(
      async () => {
        throw new Error('retry me')
      },
      {
        initialItems: ['item'],
        asyncRetryerOptions: {
          maxAttempts: 2,
          baseWait: 60_000,
          onRetry: retryStarted,
        },
      },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  TestBed.tick()
  await retry
  TestBed.tick()
  let stable = true
  const subscription = app.isStable.subscribe((value) => {
    stable = value
  })
  try {
    expect(stable).toBe(false)
  } finally {
    queue.abort()
    await app.whenStable()
    subscription.unsubscribe()
  }
})

it('releases an owner destroyed while an asynchronous callback is still running', async () => {
  let resolve!: () => void
  const injector = createEnvironmentInjector(
    [],
    TestBed.inject(EnvironmentInjector),
  )
  const loader = runInInjectionContext(injector, () =>
    injectAsyncDebouncer(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
      { wait: 0, leading: true },
    ),
  )
  const app = TestBed.inject(ApplicationRef)
  const execution = loader.maybeExecute()
  injector.destroy()
  TestBed.tick()
  try {
    await app.whenStable()
  } finally {
    resolve()
    await execution
  }
})
