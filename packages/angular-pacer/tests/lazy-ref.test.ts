import './helpers/angular'
import { Component, Input, input } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it } from 'vitest'
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
    pending = this.debouncer.state
    asyncSearch = this.asyncDebouncer.maybeExecute
  }
  Input({ required: true, isSignal: true } as Parameters<typeof Input>[0])(
    Search.prototype,
    'wait',
  )
  Component({ standalone: true, template: '' })(Search)
  const fixture = TestBed.createComponent(Search)
  fixture.componentRef.setInput('wait', 100)
  fixture.detectChanges()
  expect(fixture.componentInstance.search).toBe(
    fixture.componentInstance.debouncer.maybeExecute,
  )
  expect(fixture.componentInstance.pending()).toBe(false)
})
