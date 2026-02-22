import { Component, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { vi } from 'vitest'
import { injectQueuedValue } from '../../src/queuer/injectQueuedValue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('injectQueuedValue', () => {
  describe('behaviour', () => {
    it('returns a queued signal with addItem and queuer', () => {
      const value = signal('initial')
      const queued = TestBed.runInInjectionContext(() =>
        injectQueuedValue(value, {
          wait: 0,
        }),
      )
      expect(typeof queued).toBe('function')
      expect(queued.addItem).toBeDefined()
      expect(queued.queuer).toBeDefined()
    })

    it('pushes source signal value into the queue when it changes', () => {
      const value = signal('initial')
      const queued = TestBed.runInInjectionContext(() =>
        injectQueuedValue(value, {
          wait: 0,
        }),
      )
      TestBed.tick()
      expect(queued()).toBe('initial')
      value.set('second')
      TestBed.tick()
      expect(queued()).toBe('second')
    })

    it('waits for the wait time before processing the next item', () => {
      const value = signal('initial')
      const queued = TestBed.runInInjectionContext(() =>
        injectQueuedValue(value, {
          wait: 1000,
        }),
      )
      TestBed.tick()
      value.set('second')
      TestBed.tick()
      value.set('third')
      TestBed.tick()
      expect(queued()).toBe('initial')
      vi.advanceTimersByTime(1000)
      expect(queued()).toBe('second')
      vi.advanceTimersByTime(1000)
      expect(queued()).toBe('third')
    })
  })

  describe('with input signals', () => {
    @Component({
      selector: 'pacer-test-child',
      standalone: true,
      template: '',
    })
    class ChildComponent {
      readonly value = input.required<string>()
      readonly queued = injectQueuedValue(this.value, { wait: 0 })
    }

    @Component({
      selector: 'pacer-test-host',
      standalone: true,
      imports: [ChildComponent],
      template: '<pacer-test-child value="hello" />',
    })
    class HostComponent { }

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
      }).compileComponents()
    })

    it('does not throw when used with input.required() during component initialization', () => {
      expect(() => {
        const fixture = TestBed.createComponent(HostComponent)
        fixture.detectChanges()
      }).not.toThrow()
    })
  })
})
