import { ThemeContextProvider } from '@tanstack/devtools-ui'
import { PacerContextProvider } from '../PacerContextProvider'
import { Shell } from './Shell'

import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'

interface DevtoolsProps {
  theme: TanStackDevtoolsTheme
}

export default function PacerDevtools(props: DevtoolsProps) {
  return (
    <ThemeContextProvider theme={props.theme}>
      <PacerContextProvider>
        <Shell />
      </PacerContextProvider>
    </ThemeContextProvider>
  )
}
