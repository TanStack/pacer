/// <reference lib="es2024.promise" />

import { Component, computed, effect, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Throttler } from '@tanstack/pacer/throttler'
import { render } from '@testing-library/angular'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectThrottler } from '../../src/throttler/injectThrottler'
import { injectTestStability } from '../utils/injectTestStability'

describe('operations and selected state', () => {
  it('preserves callback arguments and exposes the selected state', async () => {
    const process = vi.fn((item: string) => item)
    const utility = TestBed.runInInjectionContext(() =>
      injectThrottler(
        process,
        { wait: 0, leading: true, trailing: false },
        (state) => ({ count: state.executionCount }),
      ),
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
      injectThrottler((item: string) => item, {
        wait: 0,
        leading: true,
        trailing: false,
      }),
    )
    expect(utility.state()).toEqual({})
    // @ts-expect-error An omitted selector cannot promise selected fields.
    utility.state().count
  })

  it('tracks selector dependencies and observes changes between an early read and connection', async () => {
    const factor = signal(2)
    const utility = TestBed.runInInjectionContext(() =>
      injectThrottler(
        (item: string) => item,
        { wait: 0, leading: true, trailing: false },
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
      injectThrottler(
        (item: string) => item,
        () => ({
          ...{ wait: 0, leading: true, trailing: false },
          onUnmount: policy(),
        }),
      ),
    )
    TestBed.tick()
    policy.set(latestCleanup)
    TestBed.resetTestingModule()
    expect(oldCleanup).not.toHaveBeenCalled()
    expect(latestCleanup).toHaveBeenCalledOnce()
    expect(latestCleanup.mock.calls[0]![0]).toBeInstanceOf(Throttler)
  })
})

describe('signal inputs', () => {
  @Component({ template: '' })
  class RequiredOptions {
    value = input.required<number>()
    utility = injectThrottler(
      (item: string) => item,
      () => ({ wait: this.value(), leading: true, trailing: false }),
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
    utility = injectThrottler(
      (item: string) => item,
      { wait: 0, leading: true, trailing: false },
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
      injectThrottler(
        process,
        () => ({ wait: 0, leading: true, trailing: false, enabled: enabled() }),
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
      const utility = injectThrottler(process, {
        ...{ wait: 0, leading: true, trailing: false },
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

it('uses changed wait inputs before effects run and cancels scheduled work on destruction', async () => {
  vi.useFakeTimers()
  const process = vi.fn((item: string) => item)
  @Component({ template: '' })
  class Host {
    wait = input.required<number>()
    utility = injectThrottler(process, () => ({
      wait: this.wait(),
      leading: false,
      trailing: true,
    }))
  }
  const { fixture } = await render(Host, { detectChangesOnRender: false })
  fixture.componentRef.setInput('wait', 10)
  fixture.detectChanges()
  fixture.componentRef.setInput('wait', 20)
  const execution = fixture.componentInstance.utility.maybeExecute('first')
  await vi.advanceTimersByTimeAsync(10)
  expect(process).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(10)
  await execution
  expect(process).toHaveBeenCalledExactlyOnceWith('first')
  const canceled = fixture.componentInstance.utility.maybeExecute('canceled')
  fixture.destroy()
  await vi.advanceTimersByTimeAsync(20)
  await canceled
  expect(process).toHaveBeenCalledOnce()
})

it('holds stability until scheduled synchronous work finishes', async () => {
  vi.useFakeTimers()
  const stability = injectTestStability()
  const process = vi.fn((item: string) => item)
  const utility = TestBed.runInInjectionContext(() =>
    injectThrottler(process, { wait: 10, leading: false, trailing: true }),
  )
  TestBed.tick()
  utility.maybeExecute('job')
  TestBed.tick()
  expect(stability.isStable).toBe(false)
  await vi.advanceTimersByTimeAsync(10)
  TestBed.tick()
  await stability.whenStable()
  expect(stability.isStable).toBe(true)
  expect(process).toHaveBeenCalledTimes(1)
})
