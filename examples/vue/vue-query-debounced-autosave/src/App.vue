<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { VueQueryDevtoolsPanel } from '@tanstack/vue-query-devtools'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { useDebouncer } from '@tanstack/vue-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'

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

const queryClient = useQueryClient()
const note = useQuery(noteQueryOptions)

// The draft is local state, so the cache only ever holds what the server has
// actually saved
const draft = ref('')
const stopInitialDraft = watch(
  () => note.data.value,
  (loadedNote) => {
    if (!loadedNote) return
    draft.value = loadedNote.text
    stopInitialDraft()
  },
)

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

// Debounce the save, not the typing. Each keystroke resets the timer, and only
// the latest draft is sent once typing pauses.
const saveDebouncer = useDebouncer(
  (text: string) => saveMutation.mutate(text),
  {
    key: 'Note Autosave Debouncer', // identifies this debouncer in the Pacer devtools
    wait: 1000, // adjust this value to see the difference
  },
  // Update when the debouncer starts or stops waiting
  (state) => ({ isPending: state.isPending }),
)

function handleInput(event: Event) {
  draft.value = (event.target as HTMLTextAreaElement).value
  saveDebouncer.maybeExecute(draft.value)
}

// Save right away instead of losing the pending draft when the page is hidden
const flush = () => saveDebouncer.flush()
window.addEventListener('pagehide', flush)
onBeforeUnmount(() => window.removeEventListener('pagehide', flush))

// Every save mutation in the cache, including ones still running
const saves = useMutationState({ filters: { mutationKey: ['saveNote'] } })

const status = computed(() =>
  saveDebouncer.state.value.isPending
    ? 'Unsaved changes'
    : saveMutation.isPending.value
      ? 'Saving...'
      : saveMutation.isError.value
        ? 'Save failed'
        : 'All changes saved',
)

const dev = import.meta.env.DEV
// Open the Pacer and Query panels as tabs to watch saves run
const plugins = [
  { ...pacerDevtoolsPlugin(), defaultOpen: true },
  {
    name: 'TanStack Query',
    component: VueQueryDevtoolsPanel,
    defaultOpen: true,
  },
]
</script>

<template>
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
    <div v-if="note.isPending.value">Loading note...</div>
    <div v-else-if="note.isError.value">Could not load note.</div>
    <div
      v-else
      style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px"
    >
      <div>
        <label style="display: block; margin-bottom: 8px">
          Note
          <textarea
            :value="draft"
            @input="handleInput"
            @blur="saveDebouncer.flush()"
            rows="6"
            style="display: block; width: 100%; margin-top: 4px"
          />
        </label>
        <p>{{ status }}</p>
      </div>
      <div>
        <h2>Saved on the server</h2>
        <p>{{ note.data.value?.text }}</p>
        <p>
          Saves sent: {{ saves.length
          }}{{
            note.data.value?.savedAt
              ? ` | Last saved at ${new Date(note.data.value.savedAt).toLocaleTimeString()}`
              : ''
          }}
        </p>
      </div>
    </div>
  </div>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
