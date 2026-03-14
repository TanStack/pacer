import { PacerContextProvider } from '../PacerContextProvider'
import { Shell } from './Shell'

import { ThemeContextProvider } from '@tanstack/devtools-ui'

import type { DevtoolProps } from '@tanstack/devtools-utils/solid'

export default function PacerDevtools(props: DevtoolProps) {
  return (
    <ThemeContextProvider theme={props.theme}>
      <PacerContextProvider>
        <Shell />
      </PacerContextProvider>
    </ThemeContextProvider>
  )
}
