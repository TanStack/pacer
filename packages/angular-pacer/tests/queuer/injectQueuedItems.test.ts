import { Component, computed, input, isSignal, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { render } from '@testing-library/angular'
import { expect, expectTypeOf, it, vi } from 'vitest'
import { injectQueuerItems } from '../../src/queuer/injectQueuedItems'

it('returns an Angular signal with a callable queuer attribute', () => {
  const value = TestBed.runInInjectionContext(() =>
    injectQueuerItems((_item: string) => {}, { started: false }),
  )
  expect(isSignal(value)).toBe(true)
  expectTypeOf(value()).toEqualTypeOf<ReadonlyArray<string>>()
  expect(value).toHaveProperty('queuer')
  TestBed.tick()
  expect(value.queuer.addItem('queued')).toBe(true)
  expect(value()).toEqual(['queued'])
})

it('reflects pending items and processes them in queue order', () => {
  const process = vi.fn((_item: string) => {})
  const value = TestBed.runInInjectionContext(() =>
    injectQueuerItems(process, { started: false }),
  )
  TestBed.tick()
  value.queuer.addItem('first')
  value.queuer.addItem('second')
  expect(value()).toEqual(['first', 'second'])
  value.queuer.execute()
  expect(process).toHaveBeenCalledExactlyOnceWith('first')
  expect(value()).toEqual(['second'])
  value.queuer.execute()
  expect(process).toHaveBeenLastCalledWith('second')
  expect(value()).toEqual([])
})

it('defers required options during setup and allows reading items in ngOnInit', async () => {
  @Component({ template: '' })
  class Host {
    wait = input.required<number>()
    items = injectQueuerItems(
      (_item: string) => {},
      () => ({
        wait: this.wait(),
        started: false,
      }),
    )
    derived = computed(this.items)
    itemsOnInit: ReadonlyArray<string> | undefined

    ngOnInit() {
      this.itemsOnInit = this.items()
    }
  }
  const { fixture } = await render(Host, { detectChangesOnRender: false })
  fixture.componentRef.setInput('wait', 100)
  fixture.detectChanges()
  expect(fixture.componentInstance.itemsOnInit).toEqual([])
  fixture.componentInstance.items.queuer.addItem('queued')
  expect(fixture.componentInstance.derived()).toEqual(['queued'])
})

it('keeps items and selected state separate and forwards the addItem shortcut', () => {
  const factor = signal(2)
  const value = TestBed.runInInjectionContext(() =>
    injectQueuerItems(
      (_item: string) => {},
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
