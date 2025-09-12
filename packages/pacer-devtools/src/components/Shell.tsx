import { createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { Header, HeaderLogo, MainPanel } from '@tanstack/devtools-ui'
import { useStyles } from '../styles/use-styles'
import { usePacerDevtoolsState } from '../PacerContextProvider'
import { UTIL_GROUPS } from './util-groups'
import { UtilList } from './UtilList'
import { DetailsPanel } from './DetailsPanel'
import type { StateKey } from './util-groups'

export function Shell() {
  const styles = useStyles()
  const state = usePacerDevtoolsState()
  const utilState = () => state
  const [selectedKey, setSelectedKey] = createSignal<string | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = createSignal(300)
  const [isDragging, setIsDragging] = createSignal(false)

  const selectedInstance = createMemo(() => {
    const key = selectedKey()
    if (!key) return null
    for (const group of UTIL_GROUPS) {
      const instance = (utilState() as unknown as Record<StateKey, Array<any>>)[
        group.key
      ].find((inst) => inst.key === key)
      if (instance) return { instance, type: group.displayName }
    }
    return null
  })

  let dragStartX = 0
  let dragStartWidth = 0

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    dragStartX = e.clientX
    dragStartWidth = leftPanelWidth()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return

    e.preventDefault()
    const deltaX = e.clientX - dragStartX
    const newWidth = Math.max(150, Math.min(800, dragStartWidth + deltaX))
    setLeftPanelWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
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
    <MainPanel>
      <Header>
        <HeaderLogo flavor={{ light: '#84cc16', dark: '#84cc16' }}>
          TanStack Pacer
        </HeaderLogo>
      </Header>

      <div class={styles().mainContainer}>
        <div
          class={styles().leftPanel}
          style={{
            width: `${leftPanelWidth()}px`,
            'min-width': '150px',
            'max-width': '800px',
          }}
        >
          <UtilList
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            utilState={utilState}
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
            utilState={utilState}
          />
        </div>
      </div>
    </MainPanel>
  )
}
