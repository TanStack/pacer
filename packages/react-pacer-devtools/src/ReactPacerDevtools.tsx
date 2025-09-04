import React, { useEffect, useRef, useState } from 'react'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools'

export interface PacerDevtoolsReactInit {
  theme?: 'light' | 'dark'
}

export const PacerDevtoolsPanel = (props?: PacerDevtoolsReactInit) => {
  const devToolRef = useRef<HTMLDivElement>(null)

  const [devtools] = useState(() => new PacerDevtoolsCore({}))
  useEffect(() => {
    if (devToolRef.current) {
      devtools.mount(devToolRef.current, props?.theme ?? 'dark')
    }

    return () => devtools.unmount()
  }, [devtools, props?.theme])

  return <div style={{ height: '100%' }} ref={devToolRef} />
}
