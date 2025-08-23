import { PacerContextProvider } from './PacerContextProvider'
import { Shell } from './components/Shell'

export default function PacerDevtools() {
  return (
    <PacerContextProvider>
      <Shell />
    </PacerContextProvider>
  )
}
