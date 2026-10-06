import './helpers/angular'
import {
  ApplicationRef,
  Component,
  Input,
  input,
  isSignal,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it, vi } from 'vitest'
import { injectAsyncQueuer } from '../src/async-queuer/injectAsyncQueuer'
import { injectQueuer } from '../src/queuer/injectQueuer'
import { injectDebouncer } from '../src/debouncer/injectDebouncer'
import { injectAsyncDebouncer } from '../src/async-debouncer/injectAsyncDebouncer'

it('allows method and state aliases before required options inputs are bound', () => {
  class Search {
    wait = input.required<number>()
    debouncer = injectDebouncer(
      (_query: string) => {},
      () => ({ wait: this.wait() }),
      (state) => state.isPending,
    )
    asyncDebouncer = injectAsyncDebouncer(
      async (_query: string) => {},
      () => ({ wait: this.wait() }),
    )
    search = this.debouncer.maybeExecute
    options = this.debouncer.options
    key = this.debouncer.key
    fn = this.debouncer.fn
    store = this.debouncer.store
    pending = this.debouncer.state
    asyncSearch = this.asyncDebouncer.maybeExecute
  }
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    Search.prototype,
    'wait',
  )
  Component({ standalone: true, template: '' })(Search)
  const fixture = TestBed.createComponent(Search)
  for (const field of ['options', 'key', 'fn', 'store', 'pending'] as const) {
    expect(isSignal(fixture.componentInstance[field])).toBe(true)
  }
  fixture.componentRef.setInput('wait', 100)
  fixture.detectChanges()
  expect(fixture.componentInstance.search).toBe(
    fixture.componentInstance.debouncer.maybeExecute,
  )
  expect(fixture.componentInstance.pending()).toBe(false)
})

it('refreshes an early state read after subscribing without reconnecting for selector signals', () => {
  const scale = signal(1)
  const utility = TestBed.runInInjectionContext(() =>
    injectDebouncer(
      () => {},
      { wait: 100, leading: true, trailing: false },
      (state) => state.executionCount * scale(),
    ),
  )
  const subscribe = vi.spyOn(utility.store(), 'subscribe')
  expect(utility.state()).toBe(0)
  utility.maybeExecute()
  TestBed.tick()
  expect(utility.state()).toBe(1)
  expect(subscribe).toHaveBeenCalledTimes(1)
  scale.set(2)
  expect(utility.state()).toBe(2)
  TestBed.tick()
  expect(subscribe).toHaveBeenCalledTimes(1)
})

it('cancels work started before the ownership effect runs', () => {
  vi.useFakeTimers()
  try {
    const execute = vi.fn()
    const utility = TestBed.runInInjectionContext(() =>
      injectDebouncer(execute, () => ({ wait: 100 })),
    )
    utility.maybeExecute()
    TestBed.resetTestingModule()
    vi.advanceTimersByTime(100)
    expect(execute).not.toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})

it('keeps queue construction inert and exposes the original initialization options', () => {
  const callback = vi.fn()
  const changed = vi.fn()
  const queue = TestBed.runInInjectionContext(() =>
    injectQueuer(callback, {
      started: false,
      initialItems: ['first'],
      onItemsChange: changed,
    }),
  )
  expect(queue.options().initialState).toBeUndefined()
  expect(queue.options().initialItems).toEqual(['first'])
  expect(changed).not.toHaveBeenCalled()
  expect(callback).not.toHaveBeenCalled()
  TestBed.tick()
  expect(queue.options().initialState).toBeUndefined()
  expect(queue.peekAllItems()).toEqual(['first'])
  expect(changed).toHaveBeenCalledTimes(1)
  expect(callback).not.toHaveBeenCalled()
})

it('matches running core queue insertion when initialItems exceed queued capacity', () => {
  const processed: number[] = []
  const queue = TestBed.runInInjectionContext(() =>
    injectQueuer(
      (item) => {
        processed.push(item)
      },
      { initialItems: [1, 2], maxSize: 1, wait: 0 },
    ),
  )
  expect(processed).toEqual([])
  TestBed.tick()
  expect(processed).toEqual([1, 2])
  expect(queue.peekAllItems()).toEqual([])
})

it('starts async initial items before inserting later items into a bounded queue', async () => {
  const processed: number[] = []
  const queue = TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(
      async (item: number) => {
        processed.push(item)
      },
      { initialItems: [1, 2], maxSize: 1, concurrency: 2, wait: 0 },
    ),
  )
  expect(processed).toEqual([])
  TestBed.tick()
  await TestBed.inject(ApplicationRef).whenStable()
  expect(processed).toEqual([1, 2])
  expect(queue.peekAllItems()).toEqual([])
})

it('reschedules restored queue items whose pendingTick has no live timer', async () => {
  const syncProcessed = vi.fn()
  const asyncProcessed = vi.fn(async (_item: number) => {})
  const initialState = { items: [1], isRunning: true, pendingTick: true }
  const [syncQueue, asyncQueue] = TestBed.runInInjectionContext(() => [
    injectQueuer(syncProcessed, { initialState, wait: 0 }),
    injectAsyncQueuer(asyncProcessed, { initialState, wait: 0 }),
  ])
  expect(syncQueue.options().initialState).toBe(initialState)
  expect(asyncQueue.options().initialState).toBe(initialState)
  TestBed.tick()
  await TestBed.inject(ApplicationRef).whenStable()
  expect(syncProcessed).toHaveBeenCalledWith(1)
  expect(asyncProcessed).toHaveBeenCalledWith(1)
})
