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
    expect(compiled.querySelector('h1')?.textContent).toContain('TanStack Pacer asyncBatch Example')
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
  it('processes urgent batches and handles simulated failures without rejection', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    app.add()
    expect(app.pendingItems()).toHaveLength(1)
    app.add(true)
    await vi.advanceTimersByTimeAsync(1000)
    expect(app.processedBatches()).toHaveLength(1)
    expect(app.successCount()).toBe(1)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    app.shouldFail.set(true)
    app.add(true)
    await vi.advanceTimersByTimeAsync(1000)
    expect(app.errorCount()).toBe(1)
    expect(app.errors()[0]).toContain('Processing failed')
  })
})
