import { usePacerState } from './context/use-context-hooks'
import { PacerContextProvider } from './context/context-provider'

function Shell() {
  const state = usePacerState()
  return (
    <div>
      Pacer state is:
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

export default function Devtools() {
  return (
    <PacerContextProvider>
      <Shell />
    </PacerContextProvider>
  )
}
