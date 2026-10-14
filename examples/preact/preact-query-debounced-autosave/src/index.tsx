import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/preact-query'
import { PreactQueryDevtoolsPanel } from '@tanstack/preact-query-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { useDebouncer } from '@tanstack/preact-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/preact-pacer-devtools'

interface Note {
  text: string
  savedAt: number | null
}

// A fake server that keeps one note in memory
let serverNote: Note = { text: 'Edit this note.', savedAt: null }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchNote() {
  await wait(300)
  return serverNote
}

async function saveNote(text: string) {
  await wait(500)
  serverNote = { text, savedAt: Date.now() }
  return serverNote
}

const noteQueryOptions = queryOptions({
  queryKey: ['note'],
  queryFn: fetchNote,
})

function NoteEditor({ initialText }: { initialText: string }) {
  const queryClient = useQueryClient()
  // The draft is local state, so the cache only ever holds what the server
  // has actually saved
  const [draft, setDraft] = useState(initialText)

  const saveMutation = useMutation({
    mutationKey: ['saveNote'],
    mutationFn: saveNote,
    // Saves with the same scope run one at a time, in order, so an older save
    // can never land after a newer one
    scope: { id: 'note' },
    onSuccess: (savedNote) => {
      queryClient.setQueryData(noteQueryOptions.queryKey, savedNote)
    },
  })

  // Debounce the save, not the typing. Each keystroke resets the timer, and
  // only the latest draft is sent once typing pauses.
  const saveDebouncer = useDebouncer(
    (text: string) => saveMutation.mutate(text),
    {
      wait: 1000, // adjust this value to see the difference
      key: 'Note Autosave Debouncer', // identifies this debouncer in the Pacer devtools
    },
    // Re-render when the debouncer starts or stops waiting
    (state) => ({ isPending: state.isPending }),
  )

  // Save right away instead of losing the pending draft when the page is hidden
  useEffect(() => {
    const flush = () => saveDebouncer.flush()
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [saveDebouncer])

  const status = saveDebouncer.state.isPending
    ? 'Unsaved changes'
    : saveMutation.isPending
      ? 'Saving...'
      : saveMutation.isError
        ? 'Save failed'
        : 'All changes saved'

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Note
        <textarea
          value={draft}
          onInput={(event) => {
            setDraft(event.currentTarget.value)
            saveDebouncer.maybeExecute(event.currentTarget.value)
          }}
          // Leaving the field saves the pending draft immediately
          onBlur={() => saveDebouncer.flush()}
          rows={6}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <p>{status}</p>
    </div>
  )
}

function SavedNote() {
  const { data: note } = useQuery(noteQueryOptions)
  // Every save mutation in the cache, including ones still running
  const saveCount = useMutationState({
    filters: { mutationKey: ['saveNote'] },
  }).length

  return (
    <div>
      <h2>Saved on the server</h2>
      <p>{note?.text}</p>
      <p>
        Saves sent: {saveCount}
        {note?.savedAt
          ? ` | Last saved at ${new Date(note.savedAt).toLocaleTimeString()}`
          : ''}
      </p>
    </div>
  )
}

function App() {
  const { data: note, isPending, isError } = useQuery(noteQueryOptions)

  return (
    <div
      className="App"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}
    >
      <h1>TanStack Pacer/Query Debounced Autosave Example</h1>
      <p>
        Saving is debounced, so the note is saved once you stop typing for 1
        second. Leaving the field or hiding the page saves right away.
      </p>
      <p>
        Saves share a mutation scope, so they reach the server one at a time and
        in order.
      </p>
      {isPending ? (
        <div>Loading note...</div>
      ) : isError ? (
        <div>Could not load note.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          <NoteEditor initialText={note.text} />
          <SavedNote />
        </div>
      )}
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
    },
  },
})

render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* Open the Pacer and Query panels as tabs to watch saves run */}
    <TanStackDevtools
      plugins={[
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        {
          name: 'TanStack Query',
          render: <PreactQueryDevtoolsPanel />,
          defaultOpen: true,
        },
      ]}
    />
  </QueryClientProvider>,
  document.getElementById('root')!,
)
