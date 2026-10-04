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
      'TanStack Pacer injectAsyncThrottler Example',
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
  it('displays simulated search failures and then recovers', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    void app.onSearch('error')
    await vi.advanceTimersByTimeAsync(1600)
    expect(app.error()).toBe('Simulated API error')
    expect(app.results()).toEqual([])
    void app.onSearch('angular')
    await vi.advanceTimersByTimeAsync(1600)
    expect(app.results()).toHaveLength(3)
    expect(app.error()).toBe('')
  })
  it('saves the latest scroll position', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    void app.onScroll(40)
    await vi.advanceTimersByTimeAsync(300)
    expect(app.lastSavedPosition()).toBe(40)
    void app.onScroll(180)
    await vi.advanceTimersByTimeAsync(1400)
    expect(app.lastSavedPosition()).toBe(180)
    expect(app.saveCount()).toBe(2)
  })
})
