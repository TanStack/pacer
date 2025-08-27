import { For } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import clsx from 'clsx'
import { useStyles } from '../styles/use-styles'
import { UTIL_GROUPS } from './util-groups'
import type { StateKey } from './util-groups'

type UtilListProps = {
  selectedKey: () => string | null
  setSelectedKey: (key: string | null) => void
  utilState: () => Record<StateKey, Array<any>>
}

export function UtilList(props: UtilListProps) {
  const styles = useStyles()

  return (
    <div class={styles().utilList}>
      <For each={UTIL_GROUPS}>
        {(group) => (
          <>
            {props.utilState()[group.key].length > 0 && (
              <div class={styles().utilGroup}>
                <div class={styles().utilGroupHeader}>{group.label}</div>
                <For each={props.utilState()[group.key]}>
                  {(instance) => {
                    const status = (() => {
                      try {
                        const statusAccessor = useStore(
                          instance.store,
                          (s: any) => s.status,
                        )
                        return () => statusAccessor() ?? 'unknown'
                      } catch {
                        return () => 'unknown'
                      }
                    })()
                    return (
                      <div
                        class={clsx(
                          styles().utilRow,
                          props.selectedKey() === instance.key &&
                            styles().utilRowSelected,
                        )}
                        onClick={() =>
                          props.setSelectedKey(instance.key ?? null)
                        }
                      >
                        <div class={styles().utilKey}>{instance.key}</div>
                        <div class={styles().utilStatus}>{status()}</div>
                      </div>
                    )
                  }}
                </For>
              </div>
            )}
          </>
        )}
      </For>
    </div>
  )
}
