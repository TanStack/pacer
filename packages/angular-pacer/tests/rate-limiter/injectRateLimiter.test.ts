/// <reference lib="es2024.promise" />

import { Component, computed, effect, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { render } from '@testing-library/angular'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectRateLimiter } from '../../src/rate-limiter/injectRateLimiter'
import { injectTestStability } from '../utils/injectTestStability'

describe('operations and selected state', () => {
  it('preserves callback arguments and exposes the selected state', async () => {
    const process = vi.fn((item: string) => item)
    const utility = TestBed.runInInjectionContext(() =>
      injectRateLimiter(process, { limit: 2, window: 10 }, (state) => ({
        count: state.executionCount,
      })),
    )
    TestBed.tick()
    expect(utility.state()).toEqual({ count: 0 })
    await utility.maybeExecute('job')
    expect(process).toHaveBeenCalledExactlyOnceWith('job')
    expect(utility.state()).toEqual({ count: 1 })
    expectTypeOf(utility.state()).toEqualTypeOf<Readonly<{ count: number }>>()
  })

  it('returns empty selected state when no selector is supplied', () => {
    const utility = TestBed.runInInjectionContext(() =>
      injectRateLimiter((item: string) => item, { limit: 2, window: 10 }),
    )
    expect(utility.state()).toEqual({})
    // @ts-expect-error An omitted selector cannot promise selected fields.
    utility.state().count
  })

  it('tracks selector dependencies and observes changes between an early read and connection', async () => {
    const factor = signal(2)
    const utility = TestBed.runInInjectionContext(() =>
      injectRateLimiter(
        (item: string) => item,
        { limit: 2, window: 10 },
        (state) => state.executionCount * factor(),
      ),
    )
    expect(utility.state()).toBe(0)
    await utility.maybeExecute('job')
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
      injectRateLimiter(
        (item: string) => item,
        () => ({ ...{ limit: 2, window: 10 }, onUnmount: policy() }),
      ),
    )
    TestBed.tick()
    policy.set(latestCleanup)
    TestBed.resetTestingModule()
    expect(oldCleanup).not.toHaveBeenCalled()
    expect(latestCleanup).toHaveBeenCalledOnce()
    expect(latestCleanup.mock.calls[0]![0]).toBeInstanceOf(RateLimiter)
  })
})

describe('signal inputs', () => {
  @Component({ template: '' })
  class RequiredOptions {
    value = input.required<number>()
    utility = injectRateLimiter(
      (item: string) => item,
      () => ({ limit: this.value(), window: 10 }),
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
    utility = injectRateLimiter(
      (item: string) => item,
      { limit: 2, window: 10 },
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
    await component.utility.maybeExecute('job')
    fixture.detectChanges()
    expect(component.valueOnInit).toBe(2)
    expect(component.derived()).toBe(2)
    fixture.componentRef.setInput('factor', 3)
    expect(component.derived()).toBe(3)
  })
})

describe('reactive options', () => {
  it('applies changed enabled options before an operation without resetting history', async () => {
    const enabled = signal(true)
    const process = vi.fn((item: string) => item)
    const utility = TestBed.runInInjectionContext(() =>
      injectRateLimiter(
        process,
        () => ({ limit: 2, window: 10, enabled: enabled() }),
        (state) => state.executionCount,
      ),
    )
    TestBed.tick()
    await utility.maybeExecute('first')
    enabled.set(false)
    await utility.maybeExecute('second')
    TestBed.tick()
    expect(process).toHaveBeenCalledExactlyOnceWith('first')
    expect(utility.state()).toBe(1)
  })

  it('keeps callback and option-function reads out of the consumer effect', async () => {
    const incidental = signal(0)
    const process = vi.fn((_item: string) => incidental())
    let runs = 0
    TestBed.runInInjectionContext(() => {
      const utility = injectRateLimiter(process, {
        ...{ limit: 2, window: 10 },
        enabled: () => incidental() >= 0,
      })
      effect(() => {
        runs++
        void utility.maybeExecute('job')
      })
    })
    TestBed.tick()
    await Promise.resolve()
    incidental.set(1)
    TestBed.tick()
    expect(runs).toBe(1)
    expect(process).toHaveBeenCalledOnce()
  })
})

it('updates the limit without resetting executions already in the window', async () => {
  vi.useFakeTimers()
  const limit = signal(1)
  const process = vi.fn((item: string) => item)
  const utility = TestBed.runInInjectionContext(() =>
    injectRateLimiter(process, () => ({ limit: limit(), window: 1000 })),
  )
  TestBed.tick()
  await utility.maybeExecute('first')
  await utility.maybeExecute('rejected')
  expect(process).toHaveBeenCalledOnce()
  limit.set(2)
  TestBed.tick()
  await utility.maybeExecute('second')
  await utility.maybeExecute('also rejected')
  expect(process.mock.calls).toEqual([['first'], ['second']])
})

it('does not hold stability for a rate-limit window after synchronous work finishes', async () => {
  const stability = injectTestStability()
  const utility = TestBed.runInInjectionContext(() =>
    injectRateLimiter((_item: string) => {}, { limit: 1, window: 60000 }),
  )
  TestBed.tick()
  expect(utility.maybeExecute('job')).toBe(true)
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)
})
