import React, { useEffect, useRef, useState } from 'react'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'

interface PacerDevtoolsReactInit {}

export const PacerDevtoolsPanel = (_props?: PacerDevtoolsReactInit) => {
  const devToolRef = useRef<HTMLDivElement>(null)

  const [devtools] = useState(() => new PacerDevtoolsCore({}))
  useEffect(() => {
    if (devToolRef.current) {
      devtools.mount(devToolRef.current)
    }

    return () => devtools.unmount()
  }, [devtools])

  return <div style={{ height: '100%' }} ref={devToolRef} />
}
