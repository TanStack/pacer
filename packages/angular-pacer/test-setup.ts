import '@testing-library/jest-dom/vitest'
import '@angular/compiler'
import { TestBed, getTestBed } from '@angular/core/testing'
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing'

import { afterEach, vi } from 'vitest'

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting())

afterEach(() => {
  TestBed.resetTestingModule()
  vi.useRealTimers()
})
