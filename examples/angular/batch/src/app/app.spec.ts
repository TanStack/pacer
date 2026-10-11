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
    expect(compiled.querySelector('h1')?.textContent).toContain('TanStack Pacer batch Example')
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
  it('processes five collected numbers as one batch', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    const fixture = TestBed.createComponent(App)
    const app = fixture.componentInstance
    fixture.detectChanges()
    TestBed.tick()
    for (let index = 0; index < 5; index++) app.add()
    expect(app.processedBatches()).toEqual([[1, 2, 3, 4, 5]])
    expect(app.pendingItems()).toEqual([])
  })
})
