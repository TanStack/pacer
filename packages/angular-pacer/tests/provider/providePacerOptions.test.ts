import { Component, computed, input, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { render } from '@testing-library/angular'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { injectDebouncer } from '../../src/debouncer/injectDebouncer'
import { providePacerOptions } from '../../src/provider/providePacerOptions'

it('types provider cleanup callbacks as core instances', () => {
  TestBed.configureTestingModule({
    providers: [
      providePacerOptions({
        debouncer: {
          onUnmount: (core) => {
            expectTypeOf(core).toEqualTypeOf<Debouncer<any>>()
          },
        },
      }),
    ],
  })
  TestBed.runInInjectionContext(() => injectDebouncer(() => {}, { wait: 100 }))
  TestBed.tick()
})

describe('provider defaults', () => {
  beforeEach(() => vi.useFakeTimers())

  it('uses provider fallbacks when a factory removes its local override', () => {
    TestBed.configureTestingModule({
      providers: [
        providePacerOptions({ debouncer: { leading: true, trailing: false } }),
      ],
    })
    const wait = signal(100)
    const process = vi.fn()
    const utility = TestBed.runInInjectionContext(() =>
      injectDebouncer(process, () => ({
        wait: wait(),
        ...(wait() === 100 ? { leading: false } : {}),
      })),
    )
    TestBed.tick()
    utility.maybeExecute('suppressed')
    expect(process).not.toHaveBeenCalled()
    wait.set(200)
    utility.maybeExecute('allowed')
    expect(process).toHaveBeenCalledExactlyOnceWith('allowed')
  })

  for (const source of ['fields', 'utility'] as const) {
    it(`tracks reactive provider ${source} defaults with static options`, () => {
      const leading = signal(true)
      const defaults =
        source === 'fields'
          ? {
              debouncer: {
                get leading() {
                  return leading()
                },
                trailing: false,
              },
            }
          : {
              get debouncer() {
                return { leading: leading(), trailing: false }
              },
            }
      TestBed.configureTestingModule({
        providers: [providePacerOptions(defaults)],
      })
      const process = vi.fn()
      const utility = TestBed.runInInjectionContext(() =>
        injectDebouncer(process, { wait: 100 }),
      )
      TestBed.tick()
      utility.maybeExecute('first')
      expect(process).toHaveBeenCalledExactlyOnceWith('first')
      utility.cancel()
      leading.set(false)
      TestBed.tick()
      utility.maybeExecute('suppressed')
      expect(process).toHaveBeenCalledOnce()
    })

    it(`defers provider ${source} getters until required inputs are bound`, async () => {
      let required!: () => boolean
      const defaults =
        source === 'fields'
          ? {
              debouncer: {
                get leading() {
                  return required()
                },
                trailing: false,
              },
            }
          : {
              get debouncer() {
                return { leading: required(), trailing: false }
              },
            }
      TestBed.configureTestingModule({
        providers: [providePacerOptions(defaults)],
      })
      @Component({ template: '' })
      class RequiredDefaults {
        leading = input.required<boolean>()
        process = vi.fn()
        utility: ReturnType<typeof injectDebouncer<() => void, number>>
        derived
        valueOnInit = -1

        constructor() {
          required = this.leading
          this.utility = injectDebouncer(
            this.process,
            { wait: 100 },
            (state) => state.executionCount,
          )
          this.derived = computed(this.utility.state)
        }

        ngOnInit() {
          this.valueOnInit = this.utility.state()
        }
      }
      const { fixture } = await render(RequiredDefaults, {
        detectChangesOnRender: false,
      })
      const component = fixture.componentInstance
      fixture.componentRef.setInput('leading', true)
      fixture.detectChanges()
      expect(component.valueOnInit).toBe(0)
      component.utility.maybeExecute()
      expect(component.process).toHaveBeenCalledOnce()
      component.utility.cancel()
      fixture.componentRef.setInput('leading', false)
      component.utility.maybeExecute()
      expect(component.process).toHaveBeenCalledOnce()
    })
  }

  it.each([false, true])(
    'uses provider cleanup fallback unless explicitly cleared: %s',
    (clear) => {
      const providerCleanup = vi.fn()
      const localCleanup = vi.fn()
      const process = vi.fn()
      const phase = signal<'local' | 'fallback' | 'clear'>('local')
      TestBed.configureTestingModule({
        providers: [
          providePacerOptions({ debouncer: { onUnmount: providerCleanup } }),
        ],
      })
      const utility = TestBed.runInInjectionContext(() =>
        injectDebouncer(process, () => ({
          wait: 100,
          ...(phase() === 'local' ? { onUnmount: localCleanup } : {}),
          ...(phase() === 'clear' ? { onUnmount: undefined } : {}),
        })),
      )
      TestBed.tick()
      phase.set('fallback')
      TestBed.tick()
      if (clear) {
        phase.set('clear')
        TestBed.tick()
        utility.maybeExecute()
      }
      TestBed.resetTestingModule()
      expect(localCleanup).not.toHaveBeenCalled()
      if (clear) {
        expect(providerCleanup).not.toHaveBeenCalled()
        vi.advanceTimersByTime(100)
        expect(process).not.toHaveBeenCalled()
      } else {
        expect(providerCleanup).toHaveBeenCalledOnce()
        expect(providerCleanup.mock.calls[0]![0]).toBeInstanceOf(Debouncer)
      }
    },
  )
})
