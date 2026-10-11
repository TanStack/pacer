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
      'TanStack Pacer injectAsyncQueuedSignal Example',
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
  it('updates concurrency while keeping the stopped queue and processes selected parallel tasks', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    const runner = app.runner
    expect(runner.state().items).toHaveLength(10)
    app.setConcurrency('3')
    TestBed.tick()
    expect(app.runner).toBe(runner)
    expect(runner.options.concurrency).toBe(3)
    expect(runner.state().items).toHaveLength(10)
    runner.start()
    await vi.advanceTimersByTimeAsync(350)
    expect(runner.state().activeItems).toHaveLength(3)
    await vi.advanceTimersByTimeAsync(500)
    expect(runner.state().successCount).toBeGreaterThanOrEqual(3)
    runner.stop()
  })
})
