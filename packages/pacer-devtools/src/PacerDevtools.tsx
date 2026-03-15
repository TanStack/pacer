import { ThemeContextProvider } from '@tanstack/devtools-ui'
import { PacerContextProvider } from './PacerContextProvider'
import { Shell } from './components/Shell'

import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'

interface PacerDevtools {
  theme: TanStackDevtoolsTheme
}

export default function PacerDevtools(props: PacerDevtools) {
  return (
    <ThemeContextProvider theme={props.theme}>
      <PacerContextProvider>
        <Shell />
      </PacerContextProvider>
    </ThemeContextProvider>
  )
}
