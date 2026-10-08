/// <reference lib="es2024.promise" />

import { Component, computed, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Queuer } from '@tanstack/pacer/queuer'
import { render } from '@testing-library/angular'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectQueuer } from '../../src/queuer/injectQueuer'
import { injectTestStability } from '../utils/injectTestStability'

describe('operations and selected state', () => {
  it('preserves callback arguments and exposes the selected state', async () => {
    const process = vi.fn((item: string) => item)
    const utility = TestBed.runInInjectionContext(() =>
      injectQueuer(
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
      injectQueuer((item: string) => item, {
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
      injectQueuer(
        (item: string) => item,
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
      injectQueuer(
        (item: string) => item,
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
    expect(latestCleanup.mock.calls[0]![0]).toBeInstanceOf(Queuer)
  })
})

describe('signal inputs', () => {
  @Component({ template: '' })
  class RequiredOptions {
    value = input.required<number>()
    utility = injectQueuer(
      (item: string) => item,
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
    utility = injectQueuer(
      (item: string) => item,
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
  const process = vi.fn((item: string) => item)
  const utility = TestBed.runInInjectionContext(() =>
    injectQueuer(process, () => ({
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
  const process = vi.fn((item: string) => item)

  TestBed.runInInjectionContext(() =>
    injectQueuer(process, { initialItems: ['first', 'second'], wait: 0 }),
  )
  expect(process).not.toHaveBeenCalled()
  TestBed.tick()

  expect(process.mock.calls).toEqual([['first'], ['second']])
})

it('starts restored queued items whose pendingTick has no live timer', async () => {
  const process = vi.fn((item: string) => item)
  const stability = injectTestStability()
  TestBed.runInInjectionContext(() =>
    injectQueuer(process, {
      initialState: { items: ['job'], isRunning: true, pendingTick: true },
      wait: 0,
    }),
  )
  TestBed.tick()
  await stability.whenStable()
  expect(process).toHaveBeenCalledExactlyOnceWith('job')
})

it('holds stability until scheduled synchronous work finishes', async () => {
  vi.useFakeTimers()
  const stability = injectTestStability()
  const process = vi.fn((item: string) => item)
  const utility = TestBed.runInInjectionContext(() =>
    injectQueuer(process, { wait: 10, started: true }),
  )
  TestBed.tick()
  utility.addItem('first')
  utility.addItem('second')
  TestBed.tick()
  expect(stability.isStable).toBe(false)
  await vi.advanceTimersByTimeAsync(20)
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)
  expect(process).toHaveBeenCalledTimes(2)
})
