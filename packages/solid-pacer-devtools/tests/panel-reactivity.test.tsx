import { createRoot, createSignal } from 'solid-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PacerDevtoolsPanel } from '../src/SolidPacerDevtools'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'

const panelProps: Array<DevtoolsPanelProps> = []

vi.mock(import('@tanstack/devtools-utils/solid'), async (importOriginal) => ({
  ...(await importOriginal()),
  createSolidPanel: () => [
    (props) => {
      panelProps.push(props)
      return null
    },
    () => null,
  ],
}))

describe('PacerDevtoolsPanel reactivity', () => {
  beforeEach(() => {
    panelProps.length = 0
  })

  it('should pass the latest theme and devtoolsOpen to the panel', () => {
    const [theme, setTheme] = createSignal<DevtoolsPanelProps['theme']>('light')
    const [devtoolsOpen, setDevtoolsOpen] = createSignal(false)

    const dispose = createRoot((dispose) => {
      ;<PacerDevtoolsPanel theme={theme()} devtoolsOpen={devtoolsOpen()} />
      return dispose
    })

    expect(panelProps).toHaveLength(1)
    expect(panelProps[0]?.theme).toBe('light')
    expect(panelProps[0]?.devtoolsOpen).toBe(false)

    setTheme('dark')
    setDevtoolsOpen(true)

    expect(panelProps).toHaveLength(1)
    expect(panelProps[0]?.theme).toBe('dark')
    expect(panelProps[0]?.devtoolsOpen).toBe(true)

    dispose()
  })

  it('should fall back to the default theme and devtoolsOpen', () => {
    const dispose = createRoot((dispose) => {
      ;<PacerDevtoolsPanel />
      return dispose
    })

    expect(panelProps[0]?.theme).toBe('dark')
    expect(panelProps[0]?.devtoolsOpen).toBe(false)

    dispose()
  })
})
