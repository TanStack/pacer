import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'
import { createSignal, onCleanup, onMount } from 'solid-js'

export interface PacerDevtoolsSolidInit {
  theme: 'light' | 'dark'
}

export const PacerDevtoolsPanel = (props?: PacerDevtoolsSolidInit) => {
  let devToolRef: HTMLDivElement | undefined
  const [devtools] = createSignal(new PacerDevtoolsCore({}))
  onMount(() => {
    if (devToolRef) {
      devtools().mount(devToolRef, props?.theme ?? "dark")

      onCleanup(() => {
        devtools().unmount()
      })
    }
  })

  return <div style={{ height: '100%' }} ref={devToolRef} />
}
