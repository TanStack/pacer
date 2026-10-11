import { shallow } from '@tanstack/store'
import type { ReactiveControllerHost } from 'lit'
import type { ReadonlyStore } from '@tanstack/store'

/** Selects state for a child host and releases its subscription on disconnection. */
export type LitPacerSubscribe<TState> = <TSelected>(
  host: ReactiveControllerHost,
  selector: (state: TState) => TSelected,
) => () => TSelected

export function createSubscribe<TState>(
  store: Pick<ReadonlyStore<TState>, 'state' | 'subscribe'>,
): LitPacerSubscribe<TState> {
  return (host, selector) => {
    let selected = selector(store.state)
    let subscription: { unsubscribe: () => void } | undefined
    const update = () => {
      const next = selector(store.state)
      if (shallow(selected, next)) return
      selected = next
      host.requestUpdate()
    }
    host.addController({
      hostConnected() {
        if (subscription) return
        update()
        subscription = store.subscribe(update)
      },
      hostUpdate: update,
      hostDisconnected() {
        subscription?.unsubscribe()
        subscription = undefined
      },
    })
    return () => selected
  }
}
