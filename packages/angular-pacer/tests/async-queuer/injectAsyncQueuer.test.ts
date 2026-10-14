/// <reference lib="es2024.promise" />

import { Component, computed, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { render } from '@testing-library/angular'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectAsyncQueuer } from '../../src/async-queuer/injectAsyncQueuer'
import { injectTestStability } from '../utils/injectTestStability'

describe('operations and selected state', () => {
  it('preserves callback arguments and exposes the selected state', async () => {
    const process = vi.fn(async (item: string) => item)
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncQueuer(
        process,
        { started: false, wait: 0, maxSize: 3 },
        (state) => ({ count: state.executionCount }),
      ),
    )
    TestBed.tick()
    expect(utility.state()).toEqual({ count: 0 })
    utility.addItem('job')
    await utility.execute()
    expect(process).toHaveBeenCalledExactlyOnceWith('job')
    expect(utility.state()).toEqual({ count: 1 })
    expectTypeOf(utility.state()).toEqualTypeOf<Readonly<{ count: number }>>()
  })

  it('returns empty selected state when no selector is supplied', () => {
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncQueuer(async (item: string) => item, {
        started: false,
        wait: 0,
        maxSize: 3,
      }),
    )
    expect(utility.state()).toEqual({})
    // @ts-expect-error An omitted selector cannot promise selected fields.
    utility.state().count
  })

  it('tracks selector dependencies and observes changes between an early read and connection', async () => {
    const factor = signal(2)
    const utility = TestBed.runInInjectionContext(() =>
      injectAsyncQueuer(
        async (item: string) => item,
        { started: false, wait: 0, maxSize: 3 },
        (state) => state.executionCount * factor(),
      ),
    )
    expect(utility.state()).toBe(0)
    utility.addItem('job')
    await utility.execute()
    TestBed.tick()
    expect(utility.state()).toBe(2)
    factor.set(3)
    expect(utility.state()).toBe(3)
  })
})

describe('cleanup', () => {
  it('uses the latest cleanup callback without waiting for the options effect', () => {
    const oldCleanup = vi.fn()
    const latestCleanup = vi.fn()
    const policy = signal(oldCleanup)
    TestBed.runInInjectionContext(() =>
      injectAsyncQueuer(
        async (item: string) => item,
        () => ({
          ...{ started: false, wait: 0, maxSize: 3 },
          onUnmount: policy(),
        }),
      ),
    )
    TestBed.tick()
    policy.set(latestCleanup)
    TestBed.resetTestingModule()
    expect(oldCleanup).not.toHaveBeenCalled()
    expect(latestCleanup).toHaveBeenCalledOnce()
    expect(latestCleanup.mock.calls[0]![0]).toBeInstanceOf(AsyncQueuer)
  })
})

describe('signal inputs', () => {
  @Component({ template: '' })
  class RequiredOptions {
    value = input.required<number>()
    utility = injectAsyncQueuer(
      async (item: string) => item,
      () => ({ started: false, maxSize: this.value() }),
      (state) => state.executionCount,
    )
    derived = computed(this.utility.state)
    valueOnInit = -1

    ngOnInit() {
      this.valueOnInit = this.utility.state()
    }
  }

  it('defers input reads during construction and reads state in ngOnInit', async () => {
    const { fixture } = await render(RequiredOptions, {
      detectChangesOnRender: false,
    })
    const component = fixture.componentInstance
    expect(component.valueOnInit).toBe(-1)
    fixture.componentRef.setInput('value', 3)
    fixture.detectChanges()
    expect(component.valueOnInit).toBe(0)
    expect(component.derived()).toBe(0)
  })

  it('destroys before input binding without evaluating required options', async () => {
    const { fixture } = await render(RequiredOptions, {
      detectChangesOnRender: false,
    })
    expect(() => fixture.destroy()).not.toThrow()
  })

  @Component({ template: '' })
  class RequiredSelector {
    factor = input.required<number>()
    utility = injectAsyncQueuer(
      async (item: string) => item,
      { started: false, wait: 0, maxSize: 3 },
      (state) => state.executionCount * this.factor(),
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
    fixture.componentRef.setInput('factor', 2)
    component.utility.addItem('job')
    await component.utility.execute()
    fixture.detectChanges()
    expect(component.valueOnInit).toBe(2)
    expect(component.derived()).toBe(2)
    fixture.componentRef.setInput('factor', 3)
    expect(component.derived()).toBe(3)
  })
})

it('preserves initial items across options updates and uses changed capacity before effects run', async () => {
  const maxSize = signal(1)
  const process = vi.fn(async (item: string) => item)
  const utility = TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(process, () => ({
      started: false,
      initialItems: ['first'],
      maxSize: maxSize(),
    })),
  )
  TestBed.tick()
  expect(utility.peekAllItems()).toEqual(['first'])
  expect(utility.addItem('rejected')).toBe(false)
  maxSize.set(2)
  expect(utility.addItem('second')).toBe(true)
  TestBed.tick()
  expect(utility.peekAllItems()).toEqual(['first', 'second'])
  await utility.flush()
  expect(process.mock.calls).toEqual([['first'], ['second']])
})

it('loads initial items lazily and processes them automatically', async () => {
  const process = vi.fn(async (item: string) => item)
  const stability = injectTestStability()
  TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(process, { initialItems: ['first', 'second'], wait: 0 }),
  )
  expect(process).not.toHaveBeenCalled()
  TestBed.tick()
  await stability.whenStable()
  expect(process.mock.calls).toEqual([['first'], ['second']])
})

it('starts restored queued items whose pendingTick has no live timer', async () => {
  const process = vi.fn(async (item: string) => item)
  const stability = injectTestStability()
  TestBed.runInInjectionContext(() =>
    injectAsyncQueuer(process, {
      initialState: { items: ['job'], isRunning: true, pendingTick: true },
      wait: 0,
    }),
  )
  TestBed.tick()
  await stability.whenStable()
  expect(process).toHaveBeenCalledExactlyOnceWith('job')
})

it('holds stability until the asynchronous result and success callback are applied', async () => {
  const stability = injectTestStability()
  const { promise, resolve } = Promise.withResolvers<string>()
  let applied = ''
  const utility = TestBed.runInInjectionContext(() =>
    injectAsyncQueuer((_item: string) => promise, {
      ...{ started: true, wait: 0 },
      onSuccess: (value) => {
        applied = value
      },
    }),
  )
  TestBed.tick()
  utility.addItem('job')
  TestBed.tick()
  const stable = stability.whenStable()
  try {
    expect(stability.isStable).toBe(false)
  } finally {
    resolve('applied')

    await stable
  }
  expect(applied).toBe('applied')
  expect(stability.isStable).toBe(true)
})
