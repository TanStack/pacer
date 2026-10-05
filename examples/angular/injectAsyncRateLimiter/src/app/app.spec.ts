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
      'TanStack Pacer injectAsyncRateLimiter Example',
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
  it('completes a search and renders its results', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    void app.onSearch('angular')
    await vi.advanceTimersByTimeAsync(2500)
    TestBed.tick()
    expect(app.results()).toEqual([
      'Result 1 for angular',
      'Result 2 for angular',
      'Result 3 for angular',
    ])
    expect(app.loading()).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('Result 1 for angular')
  })
  it('changes window type on the existing instance and records rejected calls', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    const runner = app.runner
    app.changeWindow('sliding')
    TestBed.tick()
    expect(app.runner).toBe(runner)
    expect(runner.options.windowType).toBe('sliding')
    for (let index = 0; index < 4; index++) void app.onSearch(String(index))
    await vi.advanceTimersByTimeAsync(500)
    expect(runner.state().successCount).toBe(3)
    expect(runner.state().rejectionCount).toBe(1)
  })
})
