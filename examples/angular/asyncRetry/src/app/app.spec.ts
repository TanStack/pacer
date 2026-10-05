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
    expect(compiled.querySelector('h1')?.textContent).toContain('TanStack Pacer asyncRetry Example')
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
  it('uses each selected retry configuration and returns successful user data', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    app.setScenario('linear')
    expect(app.options().backoff).toBe('linear')
    expect(app.options().maxAttempts).toBe(4)
    app.setScenario('timeout')
    expect(app.options().maxExecutionTime).toBe(2000)
    app.setScenario('jitter')
    expect(app.options().jitter).toBe(0.3)
    app.setScenario('default')
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const result = app.fetchUser()
    await vi.advanceTimersByTimeAsync(800)
    await result
    expect(app.userData()?.id).toBe(123)
    expect(app.error()).toBe('')
    expect(app.isLoading()).toBe(false)
  })
})
