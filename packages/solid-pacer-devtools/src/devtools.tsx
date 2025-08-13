import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import { createSignal, onCleanup, onMount } from 'solid-js'

interface PacerDevtoolsSolidInit {}

export const PacerDevtoolsPanel = (_props?: PacerDevtoolsSolidInit) => {
  let devToolRef: HTMLDivElement | undefined
  const [devtools] = createSignal(new PacerDevtoolsCore({}))
  onMount(() => {
    if (devToolRef) {
      devtools().mount(devToolRef)

      onCleanup(() => {
        devtools().unmount()
      })
    }
  })

  return <div style={{ height: '100%' }} ref={devToolRef} />
}
