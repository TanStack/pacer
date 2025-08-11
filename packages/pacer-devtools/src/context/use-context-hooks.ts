import { useContext } from "solid-js"
import { PacerContext } from "./context"

export const usePacerContext = () => {
  const context = useContext(PacerContext)

  return context
}

export const usePacerState = () => {
  const [state] = usePacerContext()
  return state
}