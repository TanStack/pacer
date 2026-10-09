import { isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { expect, expectTypeOf, it } from 'vitest'
import { injectAsyncQueuerItems } from '../../src/async-queuer/injectAsyncQueuedItems'

it('returns an Angular signal with the queuer as an attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectAsyncQueuerItems(async (_item: string) => {}, { started: false }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<ReadonlyArray<string>>()
  expect(value).toHaveProperty('queuer')
  TestBed.tick()
  expect(value.queuer.addItem('queued')).toBe(true)
  expect(value()).toEqual(['queued'])
})

it('keeps items and selected state separate and forwards the addItem shortcut', () => {
  const factor = signal(2)
  const value = TestBed.runInInjectionContext(() =>
    injectAsyncQueuerItems(
      async (_item: string) => {},
      { started: false },
      (state) => ({ count: state.size * factor() }),
    ),
  )
  TestBed.tick()
  expectTypeOf(value.queuer.state()).toEqualTypeOf<
    Readonly<{ count: number }>
  >()
  expect(value.addItem).toBe(value.queuer.addItem)
  expect(value.addItem('back')).toBe(true)
  expect(value.addItem('front', 'front')).toBe(true)
  expect(value()).toEqual(['front', 'back'])
  expect(value.queuer.state()).toEqual({ count: 4 })
  factor.set(3)
  expect(value.queuer.state()).toEqual({ count: 6 })
  expect(value()).toEqual(['front', 'back'])
})
