import 'zone.js'
import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  provideZoneChangeDetection,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { expect, it } from 'vitest'
import { injectDebouncer } from '../../src/debouncer/injectDebouncer'

it('renders a plain field changed by a delayed callback in zone-based Angular', async () => {
  TestBed.configureTestingModule({ providers: [provideZoneChangeDetection()] })
  @Component({
    template: '{{ message }}',
    changeDetection: ChangeDetectionStrategy.Default,
  })
  class Example {
    message = 'initial'
    inZone = false
    utility = injectDebouncer(
      (message: string) => {
        this.inZone = NgZone.isInAngularZone()
        this.message = message
      },
      { wait: 1 },
    )
  }
  const fixture = TestBed.createComponent(Example)
  fixture.autoDetectChanges()
  fixture.componentInstance.utility.maybeExecute('updated')
  await fixture.whenStable()
  expect(fixture.componentInstance.inZone).toBe(true)
  await expect.poll(() => fixture.nativeElement.textContent).toBe('updated')
})
