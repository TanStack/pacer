import { lazy } from 'solid-js'
import { Portal, render } from 'solid-js/web'

export interface PacerDevtoolsInit { }

export class PacerDevtoolsCore {
  #isMounted = false
  #dispose?: () => void
  #Component: any
  #portalRef: HTMLDivElement | null = null;
  constructor(_init?: PacerDevtoolsInit | undefined) { }

  mount<T extends HTMLElement>(el: T) {
    if (this.#isMounted) {
      throw new Error('Devtools is already mounted')
    }
    const mountTo = el
    const dispose = render(() => {
      this.#Component = lazy(() => import('./PacerDevtools'))
      const Devtools = this.#Component

      return (
        <Portal ref={this.#portalRef!} mount={mountTo}>
          <Devtools />
        </Portal>
      )
    }, mountTo)
    this.#portalRef!.style.height = '100%'
    this.#isMounted = true
    this.#dispose = dispose
  }

  unmount() {
    if (!this.#isMounted) {
      throw new Error('Devtools is not mounted')
    }
    this.#portalRef = null
    this.#dispose?.()
    this.#isMounted = false
  }
}
