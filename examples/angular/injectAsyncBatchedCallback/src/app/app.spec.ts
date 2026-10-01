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
      'TanStack Pacer injectAsyncBatchedCallback Example',
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
  it('handles failed search batches and processes email and data workflows', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    void app.addSearch('error')
    void app.addSearch('angular')
    void app.addSearch('typescript')
    await vi.advanceTimersByTimeAsync(800)
    expect(app.searchError()).toBe('Simulated batch API error')
    expect(app.results()).toEqual([])
    void app.addEmail('user@example.com')
    void app.addEmail('invalid-email')
    void app.addData('sales')
    await vi.advanceTimersByTimeAsync(3600)
    expect(app.validations().map((result) => result.isValid)).toEqual([
      true,
      false,
    ])
    expect(app.processed()).toHaveLength(1)
    expect(app.processed()[0]!.value).toBe(app.points()[0]!.value * 2)
    expect(app.summaries()[0]!.categories).toBe(1)
  })
})
