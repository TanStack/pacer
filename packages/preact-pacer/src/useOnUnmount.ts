import { useEffect, useLayoutEffect, useRef } from 'preact/hooks'

const useCommitEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Register teardown once and only publish callbacks from committed renders. */
export function useOnUnmount(cleanup: () => void): void {
  const cleanupRef = useRef(cleanup)

  useCommitEffect(() => {
    cleanupRef.current = cleanup
  })

  useEffect(() => {
    return () => cleanupRef.current()
  }, [])
}
