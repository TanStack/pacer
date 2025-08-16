import { createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { useStyles } from '../styles/use-styles'
import { usePacerDevtoolsState } from '../PacerContextProvider'
import { UTIL_GROUPS } from './util-groups'
import { UtilList } from './UtilList'
import { DetailsPanel } from './DetailsPanel'
import type { StateKey } from './util-groups'

export function Shell() {
  const styles = useStyles()
  const state = usePacerDevtoolsState()
  const [selectedKey, setSelectedKey] = createSignal<string | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = createSignal(300)
  const [isDragging, setIsDragging] = createSignal(false)

  const getGroupItems = (key: StateKey) =>
    (state as unknown as Record<StateKey, Array<any>>)[key]

  const selectedInstance = createMemo(() => {
    const key = selectedKey()
    if (!key) return null
    for (const group of UTIL_GROUPS) {
      const instance = getGroupItems(group.key).find((inst) => inst.key === key)
      if (instance) return { instance, type: group.displayName }
    }
    return null
  })

  const getStatus = (inst: any) => {
    try {
      return inst.store?.state?.status ?? 'unknown'
    } catch {
      return 'unknown'
    }
  }

  let dragStartX = 0
  let dragStartWidth = 0

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    dragStartX = e.clientX
    dragStartWidth = leftPanelWidth()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return

    const deltaX = e.clientX - dragStartX
    const newWidth = Math.max(150, Math.min(800, dragStartWidth + deltaX))
    setLeftPanelWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return (
    <div class={styles().devtoolsPanel}>
      <div class={styles().stickyHeader}>TanStack Pacer</div>

      <div class={styles().mainContainer}>
        <div
          class={styles().leftPanel}
          style={{
            width: `${leftPanelWidth()}px`,
            'min-width': '150px',
            'max-width': '800px',
          }}
        >
          <div class={styles().panelHeader}>Utils</div>
          <UtilList
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            getGroupItems={getGroupItems}
            getStatus={getStatus}
          />
        </div>

        <div
          class={`${styles().dragHandle} ${isDragging() ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div class={styles().rightPanel} style={{ flex: 1 }}>
          <div class={styles().panelHeader}>Details</div>
          <DetailsPanel
            selectedInstance={selectedInstance}
            lastUpdatedByKey={() => state.lastUpdatedByKey}
          />
        </div>
      </div>
    </div>
  )
}
