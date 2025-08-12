import { For } from 'solid-js'
import clsx from 'clsx'
import { usePacerState } from './context/use-context-hooks'
import { PacerContextProvider } from './context/context-provider'
import { useStyles } from './styles/use-styles'
import { JsonTree } from './tree'

type StateKey =
  | 'asyncBatcherState'
  | 'asyncDebouncerState'
  | 'asyncQueuerState'
  | 'asyncRateLimiterState'
  | 'asyncThrottlerState'
  | 'batcherState'
  | 'debouncerState'
  | 'queuerState'
  | 'rateLimiterState'
  | 'throttlerState'

const CONTEXT_SECTIONS: Array<{ key: StateKey; label: string }> = [
  { key: 'asyncBatcherState', label: 'Async Batcher State' },
  { key: 'asyncDebouncerState', label: 'Async Debouncer State' },
  { key: 'asyncQueuerState', label: 'Async Queuer State' },
  { key: 'asyncRateLimiterState', label: 'Async Rate Limiter State' },
  { key: 'asyncThrottlerState', label: 'Async Throttler State' },
  { key: 'batcherState', label: 'Batcher State' },
  { key: 'debouncerState', label: 'Debouncer State' },
  { key: 'queuerState', label: 'Queuer State' },
  { key: 'rateLimiterState', label: 'Rate Limiter State' },
  { key: 'throttlerState', label: 'Throttler State' },
]

function Section({ key, label }: { key: StateKey; label: string }) {
  const state = usePacerState()
  const styles = useStyles()

  return (
    <>
      {state[key].length === 0 ? null : (
        <section class={styles().section}>
          <div class={styles().sectionHeader}>{label}</div>
          <div class={styles().instanceList}>
            <For each={state[key]}>
              {(inst) => <AnimatedInstanceCard value={inst} />}
            </For>
          </div>
        </section>
      )}
    </>
  )
}

function Shell() {
  const styles = useStyles()

  return (
    <div class={styles().devtoolsPanel}>
      <div class={styles().stickyHeader}>TanStack Pacer</div>

      <div class={styles().sectionContainer}>
        <For each={CONTEXT_SECTIONS}>
          {({ key, label }) => <Section key={key} label={label} />}
        </For>
      </div>
    </div>
  )
}

function AnimatedInstanceCard(props: { value: any }) {
  const styles = useStyles()

  return (
    <div class={clsx(styles().instanceCard)}>
      <JsonTree value={props.value} />
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
