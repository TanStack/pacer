<script lang="ts">
  import {
    QueryClient,
    QueryClientProvider,
    createMutation,
    createQuery,
    queryOptions,
    useMutationState,
  } from '@tanstack/svelte-query'
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { createDebouncer } from '@tanstack/svelte-pacer'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import QueryDevtoolsPanel from './QueryDevtoolsPanel.svelte'

  interface Note {
    text: string
    savedAt: number | null
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  })

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

  const note = createQuery(
    () => noteQueryOptions,
    () => queryClient,
  )

  // The draft is local state, so the cache only ever holds what the server
  // has actually saved
  let draft = $state('')
  let isDraftLoaded = false
  $effect(() => {
    if (!note.data || isDraftLoaded) return
    draft = note.data.text
    isDraftLoaded = true
  })

  const saveMutation = createMutation(
    () => ({
      mutationKey: ['saveNote'],
      mutationFn: saveNote,
      // Saves with the same scope run one at a time, in order, so an older
      // save can never land after a newer one
      scope: { id: 'note' },
      onSuccess: (savedNote: Note) => {
        queryClient.setQueryData(noteQueryOptions.queryKey, savedNote)
      },
    }),
    () => queryClient,
  )

  // Debounce the save, not the typing. Each keystroke resets the timer, and
  // only the latest draft is sent once typing pauses.
  const saveDebouncer = createDebouncer(
    (text: string) => saveMutation.mutate(text),
    {
      key: 'Note Autosave Debouncer', // identifies this debouncer in the Pacer devtools
      wait: 1000, // adjust this value to see the difference
    },
    // Update when the debouncer starts or stops waiting
    (state) => ({ isPending: state.isPending }),
  )

  // Every save mutation in the cache, including ones still running
  const saves = useMutationState(
    { filters: { mutationKey: ['saveNote'] } },
    queryClient,
  )

  const status = $derived(
    saveDebouncer.state.isPending
      ? 'Unsaved changes'
      : saveMutation.isPending
        ? 'Saving...'
        : saveMutation.isError
          ? 'Save failed'
          : 'All changes saved',
  )

  // Open the Pacer and Query panels as tabs to watch saves run
  const plugins = [
    { ...pacerDevtoolsPlugin(), defaultOpen: true },
    {
      name: 'TanStack Query',
      component: QueryDevtoolsPanel,
      props: { client: queryClient },
      defaultOpen: true,
    },
  ]
</script>

<!-- Save right away instead of losing the pending draft when the page is hidden -->
<svelte:window onpagehide={() => saveDebouncer.flush()} />

<QueryClientProvider client={queryClient}>
  <div class="App" style="max-width: 800px; margin: 0 auto; padding: 20px">
    <h1>TanStack Pacer/Query Debounced Autosave Example</h1>
    <p>
      Saving is debounced, so the note is saved once you stop typing for 1
      second. Leaving the field or hiding the page saves right away.
    </p>
    <p>
      Saves share a mutation scope, so they reach the server one at a time and
      in order.
    </p>
    {#if note.isPending}
      <div>Loading note...</div>
    {:else if note.isError}
      <div>Could not load note.</div>
    {:else}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
        <div>
          <label style="display: block; margin-bottom: 8px">
            Note
            <textarea
              value={draft}
              oninput={(event) => {
                draft = event.currentTarget.value
                saveDebouncer.maybeExecute(draft)
              }}
              onblur={() => saveDebouncer.flush()}
              rows="6"
              style="display: block; width: 100%; margin-top: 4px"></textarea>
          </label>
          <p>{status}</p>
        </div>
        <div>
          <h2>Saved on the server</h2>
          <p>{note.data.text}</p>
          <p>
            Saves sent: {saves.length}{note.data.savedAt
              ? ` | Last saved at ${new Date(note.data.savedAt).toLocaleTimeString()}`
              : ''}
          </p>
        </div>
      </div>
    {/if}
  </div>
  {#if import.meta.env.DEV}<TanStackDevtools {plugins} />{/if}
</QueryClientProvider>
