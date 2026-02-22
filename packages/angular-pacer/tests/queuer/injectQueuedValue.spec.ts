import { Component, input } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { injectQueuedValue } from '../../src/queuer/injectQueuedValue'

describe('injectQueuedValue', () => {
  describe("with input signals", () => {
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