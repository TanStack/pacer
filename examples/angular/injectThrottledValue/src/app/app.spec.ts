import { vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import { App } from './app'

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App)
    await fixture.whenStable()
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'TanStack Pacer injectThrottledValue Example',
    )
  })
})

// Exercise the real adapter and component with a deterministic clock.
describe('example behavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents()
  })
  afterEach(() => {
    TestBed.resetTestingModule()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  it('runs the counter, search, and range scenarios', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    app.increment()
    app.increment()
    app.increment()
    app.onSearch('angular')
    app.onRange(73)
    TestBed.tick()
    await vi.advanceTimersByTimeAsync(1100)
    TestBed.tick()
    expect(app.controlledCount()).toBe(3)
    expect(app.controlledSearch()).toBe('angular')
    expect(app.controlledValue()).toBe(73)
  })
  it('counts the initial value when displaying saved executions', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    await vi.advanceTimersByTimeAsync(1100)
    expect(
      app.instantExecutions() - app.rangeRunner.state().executionCount,
    ).toBe(0)
    expect(app.reduction()).toBe(0)
  })
})
