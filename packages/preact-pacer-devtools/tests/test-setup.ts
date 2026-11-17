import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/preact'
import { afterEach, expect } from 'vitest'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
