import { lazy } from 'solid-js'
import { Portal, render } from 'solid-js/web'

export interface PacerDevtoolsInit {}

export class PacerDevtoolsCore {
  #isMounted = false
  #dispose?: () => void
  #Component: any

  constructor(_init?: PacerDevtoolsInit | undefined) {}

  mount<T extends HTMLElement>(el: T) {
    if (this.#isMounted) {
      throw new Error('Devtools is already mounted')
    }
    const mountTo = el
    const dispose = render(() => {
      this.#Component = lazy(() => import('./PacerDevtools'))
      const Devtools = this.#Component

      return (
        <Portal mount={mountTo}>
          <Devtools />
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
