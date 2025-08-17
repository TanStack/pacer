import { For } from 'solid-js'
import clsx from 'clsx'
import { useStyles } from '../styles/use-styles'
import { UTIL_GROUPS } from './util-groups'
import type { StateKey } from './util-groups'

type UtilListProps = {
  selectedKey: () => string | null
  setSelectedKey: (key: string | null) => void
  getGroupItems: (key: StateKey) => Array<any>
  getStatus: (inst: any) => string
}

export function UtilList(props: UtilListProps) {
  const styles = useStyles()

  return (
    <div class={styles().utilList}>
      <For each={UTIL_GROUPS}>
        {(group) => (
          <>
            {props.getGroupItems(group.key).length > 0 && (
              <div class={styles().utilGroup}>
                <div class={styles().utilGroupHeader}>{group.label}</div>
                <For each={props.getGroupItems(group.key)}>
                  {(instance) => (
                    <div
                      class={clsx(
                        styles().utilRow,
                        props.selectedKey() === instance.key &&
                          styles().utilRowSelected,
                      )}
                      onClick={() => props.setSelectedKey(instance.key ?? null)}
                    >
                      <div class={styles().utilKey}>{instance.key}</div>
                      <div class={styles().utilStatus}>
                        {props.getStatus(instance)}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </>
        )}
      </For>
    </div>
  )
}
