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
      'TanStack Pacer injectAsyncDebouncedCallback Example',
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
  it('validates email and clears the result when empty', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    void app.onEmail('user@example.com')
    await vi.advanceTimersByTimeAsync(1200)
    expect(app.validation()?.isValid).toBe(true)
    void app.onEmail('')
    await vi.advanceTimersByTimeAsync(800)
    expect(app.validation()).toBeNull()
  })
})
