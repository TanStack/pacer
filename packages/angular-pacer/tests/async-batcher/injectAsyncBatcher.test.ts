/// <reference lib="es2024.promise" />

import { Component, computed, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { render } from '@testing-library/angular'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectAsyncBatcher } from '../../src/async-batcher/injectAsyncBatcher'
import { injectTestStability } from '../utils/injectTestStability'

describe('selected state', () => {
  it('returns empty state when no selector is supplied', () => {
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher<number>(async () => {}),
    )
    expect(utility.state()).toEqual({})
    expectTypeOf(utility.state()).toEqualTypeOf<Readonly<{}>>()
    // @ts-expect-error An omitted selector cannot promise selected fields.
    utility.state().count

    TestBed.runInInjectionContext(() => {
      // @ts-expect-error A caller-selected state type requires a selector.
      injectAsyncBatcher<number, { count: number }>(async () => {})
    })
  })

  it('infers selected fields and updates them after execution', async () => {
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(
        async (_items: Array<number>) => {},
        { maxSize: 1 },
        (state) => ({ count: state.executionCount }),
      ),
    )
    TestBed.tick()
    expectTypeOf(utility.state()).toEqualTypeOf<Readonly<{ count: number }>>()
    expect(utility.state()).toEqual({ count: 0 })
    await utility.addItem(1)
    expect(utility.state()).toEqual({ count: 1 })
  })
})

describe('stability', () => {
  it('awaits automatic execution triggered by async batch capacity, including result callbacks', async () => {
    const stability = injectTestStability()

    const { promise, resolve } = Promise.withResolvers<string>()
    let applied = ''
    const batcher = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher((_items: Array<string>) => promise, {
        maxSize: 1,
        onSuccess: (value) => {
          applied = value
        },
      }),
    )

    const execution = batcher.addItem('job')
    const stabilityPromise = stability.whenStable()

    try {
      expect(stability.isStable).toBe(false)
    } finally {
      resolve('applied')
      await execution
      await stabilityPromise
    }
    expect(applied).toBe('applied')
    expect(stability.isStable).toBe(true)
  })
})

describe('cleanup', () => {
  it('uses the latest cleanup policy without waiting for the options effect', () => {
    const oldCleanup = vi.fn()
    const latestCleanup = vi.fn()
    const policy = signal(oldCleanup)
    TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(
        async () => {},
        () => ({
          wait: Infinity,
          onUnmount: policy(),
        }),
      ),
    )
    TestBed.tick()
    policy.set(latestCleanup)
    TestBed.resetTestingModule()
    expect(latestCleanup).toHaveBeenCalledTimes(1)
    expect(oldCleanup).not.toHaveBeenCalled()
  })

  it('passes the core batcher with its queued items to custom cleanup', async () => {
    const cleanup = vi.fn<(core: AsyncBatcher<string>) => void>()
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(async (_items: Array<string>) => {}, {
        wait: Infinity,
        onUnmount: cleanup,
      }),
    )
    TestBed.tick()
    await utility.addItem('queued')
    TestBed.resetTestingModule()
    expect(cleanup).toHaveBeenCalledOnce()
    const core = cleanup.mock.calls[0]![0]
    expect(core).toBeInstanceOf(AsyncBatcher)
    expect(core.peekAllItems()).toEqual(['queued'])
  })

  it('cancels a scheduled batch on destruction after options change', async () => {
    vi.useFakeTimers()
    const wait = signal(10)
    const process = vi.fn(async (_items: Array<string>) => {})
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(process, () => ({ wait: wait() })),
    )
    TestBed.tick()
    const pending = utility.addItem('job')
    wait.set(20)
    TestBed.tick()
    TestBed.resetTestingModule()
    await vi.advanceTimersByTimeAsync(20)
    await pending
    expect(process).not.toHaveBeenCalled()
  })
})

describe('options', () => {
  beforeEach(() => vi.useFakeTimers())

  it('updates factory options without losing queued items and uses the latest cleanup', async () => {
    const first = vi.fn()
    const latest = vi.fn()
    const maxSize = signal(3)
    const process = vi.fn(async (_items: Array<string>) => {})
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(process, () => ({
        wait: Infinity,
        maxSize: maxSize(),
        onUnmount: maxSize() === 3 ? first : latest,
      })),
    )
    TestBed.tick()
    await utility.addItem('first')
    expect(process).not.toHaveBeenCalled()
    maxSize.set(2)
    TestBed.tick()
    expect(utility.peekAllItems()).toEqual(['first'])
    await utility.addItem('second')
    expect(process).toHaveBeenCalledExactlyOnceWith(['first', 'second'])
    expect(first).not.toHaveBeenCalled()
    expect(latest).not.toHaveBeenCalled()
    TestBed.resetTestingModule()
    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledOnce()
    expect(latest.mock.calls[0]![0]).toBeInstanceOf(AsyncBatcher)
  })

  it('uses changed options for an operation before the options effect runs', async () => {
    const maxSize = signal(3)
    const process = vi.fn(async (_items: Array<string>) => {})
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncBatcher(process, () => ({
        wait: Infinity,
        maxSize: maxSize(),
      })),
    )
    TestBed.tick()
    await utility.addItem('first')
    maxSize.set(2)
    await utility.addItem('second')
    expect(process).toHaveBeenCalledExactlyOnceWith(['first', 'second'])
  })
})

describe('signal inputs', () => {
  @Component({ template: '' })
  class RequiredOptions {
    maxSize = input.required<number>()
    process = vi.fn(async (_items: Array<string>) => {})
    utility = injectAsyncBatcher(
      this.process,
      () => ({
        wait: Infinity,
        maxSize: this.maxSize(),
      }),
      (state) => state.size,
    )
    derived = computed(this.utility.state)
    valueOnInit = -1

    ngOnInit() {
      this.valueOnInit = this.utility.state()
    }
  }

  it('defers required options during construction and reads state in ngOnInit', async () => {
    const { fixture } = await render(RequiredOptions, {
      detectChangesOnRender: false,
    })
    const component = fixture.componentInstance
    expect(component.valueOnInit).toBe(-1)

    fixture.componentRef.setInput('maxSize', 3)
    fixture.detectChanges()
    expect(component.valueOnInit).toBe(0)
    expect(component.derived()).toBe(0)

    await component.utility.addItem('first')
    fixture.detectChanges()
    expect(component.derived()).toBe(1)
  })

  it('uses bound and changed input options before effects run', async () => {
    const { fixture } = await render(RequiredOptions, {
      detectChangesOnRender: false,
    })
    const { utility, process } = fixture.componentInstance

    fixture.componentRef.setInput('maxSize', 3)
    await utility.addItem('first')
    expect(process).not.toHaveBeenCalled()

    fixture.componentRef.setInput('maxSize', 2)
    await utility.addItem('second')
    expect(process).toHaveBeenCalledExactlyOnceWith(['first', 'second'])
  })

  @Component({ template: '' })
  class RequiredSelector {
    multiplier = input.required<number>()
    utility = injectAsyncBatcher(
      async (_items: Array<string>) => {},
      { wait: Infinity },
      (state) => state.size * this.multiplier(),
    )
    derived = computed(this.utility.state)
    valueOnInit = -1

    ngOnInit() {
      this.valueOnInit = this.utility.state()
    }
  }

  it('reads required selector inputs in ngOnInit and tracks later changes', async () => {
    const { fixture } = await render(RequiredSelector, {
      detectChangesOnRender: false,
    })
    const component = fixture.componentInstance
    expect(component.valueOnInit).toBe(-1)

    fixture.componentRef.setInput('multiplier', 2)
    await component.utility.addItem('first')
    fixture.detectChanges()
    expect(component.valueOnInit).toBe(2)
    expect(component.derived()).toBe(2)

    fixture.componentRef.setInput('multiplier', 3)
    expect(component.derived()).toBe(3)
  })

  it('destroys the ref before required options are bound without evaluating them', async () => {
    const { fixture } = await render(RequiredOptions, {
      detectChangesOnRender: false,
    })
    expect(() => fixture.destroy()).not.toThrow()
  })
})
