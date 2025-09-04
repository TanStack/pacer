import { lazy } from 'solid-js'
import { Portal, render } from 'solid-js/web'

export interface PacerDevtoolsInit { }

export class PacerDevtoolsCore {
  #isMounted = false
  #dispose?: () => void
  #Component: any
  #ThemeProvider: any

  constructor(_init?: PacerDevtoolsInit | undefined) { }

  mount<T extends HTMLElement>(el: T, theme: 'light' | 'dark') {
    if (this.#isMounted) {
      throw new Error('Devtools is already mounted')
    }
    const mountTo = el
    const dispose = render(() => {
      this.#Component = lazy(() => import('./PacerDevtools'))
      const Devtools = this.#Component
      this.#ThemeProvider = lazy(() => import('@tanstack/devtools-ui').then((mod) => ({ default: mod.ThemeContextProvider })))
      const ThemeProvider = this.#ThemeProvider

      return (
        <Portal mount={mountTo}>
          <div style={{ height: '100%' }}>
            <ThemeProvider theme={theme}>
              <Devtools />
            </ThemeProvider>
          </div>
        </Portal>
      )
    }, mountTo)
    this.#isMounted = true
    this.#dispose = dispose
  }

  unmount() {
    if (!this.#isMounted) {
      throw new Error('Devtools is not mounted')
    }
    this.#dispose?.()
    this.#isMounted = false
  }
}
