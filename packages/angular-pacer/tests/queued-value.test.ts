import '@angular/compiler'
import { Component, Input, input, isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { injectQueuedValue } from '../src/queuer/injectQueuedValue'

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
)
beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  TestBed.resetTestingModule()
  vi.useRealTimers()
})

it('returns the processed scalar while retaining pending queue items', () => {
  const source = signal('initial')
  const queued = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, { started: false }),
  )
  TestBed.tick()
  expect(isSignal(queued)).toBe(true)
  expect(queued()).toBe('initial')
  source.set('next')
  TestBed.tick()
  expect(queued()).toBe('initial')
  expect(queued.queuer.peekAllItems()).toEqual(['initial', 'next'])
  queued.queuer.flush()
  expect(queued()).toBe('next')
})

it('constructs before required source inputs are bound', () => {
  class RequiredSource {
    source = input.required<string>()
    queued = injectQueuedValue(this.source, { started: false })
  }
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    RequiredSource.prototype,
    'source',
  )
  Component({ standalone: true, template: '' })(RequiredSource)
  const fixture = TestBed.createComponent(RequiredSource)
  expect(() => fixture.componentInstance.queued()).toThrow(/NG0950/)
  fixture.componentRef.setInput('source', 'bound')
  fixture.detectChanges()
  expect(fixture.componentInstance.queued()).toBe('bound')
})

it.each([0, false, '', null, undefined, 0n, Symbol('initial')])(
  'preserves the initial source value %s',
  (initial) => {
    const queued = TestBed.runInInjectionContext(() =>
      injectQueuedValue(signal(initial)),
    )
    expect(queued()).toBe(initial)
  },
)

it('preserves object and function source values as data', () => {
  const object = { label: 'initial' }
  const fn = vi.fn(() => 'initial')
  const [objectValue, functionValue] = TestBed.runInInjectionContext(() => [
    injectQueuedValue(signal(object)),
    injectQueuedValue(signal(fn)),
  ])
  expect(objectValue()).toBe(object)
  expect(functionValue()).toBe(fn)
  TestBed.tick()
  expect(functionValue()).toBe(fn)
  expect(fn).not.toHaveBeenCalled()
})

it('preserves selectors and processes manual values in queue order', () => {
  const source = signal('source')
  const queued = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, { started: false, wait: 100 }, (state) => ({
      items: state.items,
      size: state.size,
    })),
  )
  expect(queued()).toBe('source')
  TestBed.tick()
  queued.addItem('manual')
  expect(queued.queuer.state().size).toBe(2)
  queued.queuer.start()
  expect(queued()).toBe('source')
  vi.advanceTimersByTime(99)
  expect(queued()).toBe('source')
  vi.advanceTimersByTime(1)
  expect(queued()).toBe('manual')
  expect(queued.queuer.state().items).toEqual([])
})

it('observes only source changes when enqueuing values', () => {
  const source = signal('initial'),
    wait = signal(100)
  const queued = TestBed.runInInjectionContext(() =>
    injectQueuedValue(source, () => ({ wait: wait(), started: false })),
  )
  TestBed.tick()
  expect(queued.queuer.peekAllItems()).toEqual(['initial'])
  wait.set(200)
  TestBed.tick()
  queued.queuer.execute()
  TestBed.tick()
  expect(queued.queuer.peekAllItems()).toEqual([])
  source.set('intermediate')
  source.set('latest')
  TestBed.tick()
  expect(queued.queuer.peekAllItems()).toEqual(['latest'])
  expect(queued()).toBe('initial')
  queued.queuer.execute()
  expect(queued()).toBe('latest')
})

it('supports required source and option inputs across the supported forms', () => {
  class RequiredInputs {
    source = input.required<string>()
    wait = input.required<number>()
    defaultOptions = injectQueuedValue(this.source)
    factoryOptions = injectQueuedValue(this.source, () => ({
      wait: this.wait(),
      started: false,
    }))
  }
  for (const property of ['source', 'wait']) {
    Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
      RequiredInputs.prototype,
      property,
    )
  }
  Component({ standalone: true, template: '' })(RequiredInputs)
  const fixture = TestBed.createComponent(RequiredInputs)
  fixture.componentRef.setInput('source', 'bound')
  fixture.componentRef.setInput('wait', 100)
  fixture.detectChanges()
  expect(fixture.componentInstance.defaultOptions()).toBe('bound')
  expect(fixture.componentInstance.factoryOptions()).toBe('bound')
})

it('stops pending work when its injection context is destroyed', () => {
  const processed = vi.fn()
  const queued = TestBed.runInInjectionContext(() =>
    injectQueuedValue(signal('source'), { wait: 100, onExecute: processed }),
  )
  TestBed.tick()
  queued.addItem('later')
  TestBed.resetTestingModule()
  vi.advanceTimersByTime(100)
  expect(queued()).toBe('source')
  expect(processed).toHaveBeenCalledOnce()
})
