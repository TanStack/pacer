import {
  QueryClient,
  QueryClientProvider,
  createMutationController,
  createQueryController,
  queryOptions,
  useMutationState,
  onlineManager,
} from '@tanstack/lit-query'
import { LitElement, html } from 'lit'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { TanstackQueryDevtoolsPanel } from '@tanstack/query-devtools'
import { createDebouncer } from '@tanstack/lit-pacer'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import type { TanStackDevtoolsPlugin } from '@tanstack/devtools'

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

// Mount the core Query panel into the TanStack Devtools plugin container
function queryDevtoolsPlugin(client: QueryClient): TanStackDevtoolsPlugin {
  let panel: TanstackQueryDevtoolsPanel | undefined
  return {
    name: 'TanStack Query',
    defaultOpen: true,
    render: (element, { theme }) => {
      if (!panel) {
        panel = new TanstackQueryDevtoolsPanel({
          client,
          queryFlavor: 'Lit Query',
          version: '5',
          onlineManager,
        })
        panel.mount(element)
      }
      panel.setTheme(theme)
    },
    destroy: () => {
      panel?.unmount()
      panel = undefined
    },
  }
}

class Example extends LitElement {
  static properties = { draft: { state: true } }
  // The draft is local state, so the cache only ever holds what the server
  // has actually saved
  draft: string | null = null

  private note = createQueryController(this, noteQueryOptions)

  private saveMutation = createMutationController(this, {
    mutationKey: ['saveNote'],
    mutationFn: saveNote,
    // Saves with the same scope run one at a time, in order, so an older save
    // can never land after a newer one
    scope: { id: 'note' },
    onSuccess: (savedNote: Note) => {
      queryClient.setQueryData(noteQueryOptions.queryKey, savedNote)
    },
  })

  // Debounce the save, not the typing. Each keystroke resets the timer, and
  // only the latest draft is sent once typing pauses.
  private saveDebouncer = createDebouncer(
    this,
    (text: string) => this.saveMutation.mutate(text),
    {
      key: 'Note Autosave Debouncer', // identifies this debouncer in the Pacer devtools
      wait: 1000, // adjust this value to see the difference
    },
    // Re-render when the debouncer starts or stops waiting
    (state) => ({ isPending: state.isPending }),
  )

  // Every save mutation in the cache, including ones still running
  private saves = useMutationState(this, {
    filters: { mutationKey: ['saveNote'] },
  })

  // Save right away instead of losing the pending draft when the page is hidden
  private flush = () => this.saveDebouncer.flush()

  private devtools?: TanStackDevtoolsCore
  private target?: HTMLDivElement

  override createRenderRoot() {
    return this
  }

  override connectedCallback() {
    super.connectedCallback()
    window.addEventListener('pagehide', this.flush)
    if (!import.meta.env.DEV) return
    this.target = document.createElement('div')
    document.body.append(this.target)
    // Open the Pacer and Query panels as tabs to watch saves run
    this.devtools = new TanStackDevtoolsCore({
      plugins: [
        { ...pacerDevtoolsPlugin(), defaultOpen: true },
        queryDevtoolsPlugin(queryClient),
      ],
    })
    this.devtools.mount(this.target)
  }

  override disconnectedCallback() {
    window.removeEventListener('pagehide', this.flush)
    this.devtools?.unmount()
    this.target?.remove()
    this.devtools = undefined
    this.target = undefined
    super.disconnectedCallback()
  }

  override render() {
    const note = this.note()
    const saveMutation = this.saveMutation()
    const status = this.saveDebouncer.state.isPending
      ? 'Unsaved changes'
      : saveMutation.isPending
        ? 'Saving...'
        : saveMutation.isError
          ? 'Save failed'
          : 'All changes saved'
    return html`<div
      class="App"
      style="max-width: 800px; margin: 0 auto; padding: 20px"
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
      ${
        note.isPending
          ? html`<div>Loading note...</div>`
          : note.isError
            ? html`<div>Could not load note.</div>`
            : html`<div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px"
              >
                <div>
                  <label style="display: block; margin-bottom: 8px">
                    Note
                    <textarea
                      .value=${this.draft ?? note.data.text}
                      @input=${(event: InputEvent) => {
                        this.draft = (event.target as HTMLTextAreaElement).value
                        this.saveDebouncer.maybeExecute(this.draft)
                      }}
                      @blur=${() => this.saveDebouncer.flush()}
                      rows="6"
                      style="display: block; width: 100%; margin-top: 4px"
                    ></textarea>
                  </label>
                  <p>${status}</p>
                </div>
                <div>
                  <h2>Saved on the server</h2>
                  <p>${note.data.text}</p>
                  <p>
                    Saves sent:
                    ${this.saves().length}${
                      note.data.savedAt
                        ? ` | Last saved at ${new Date(note.data.savedAt).toLocaleTimeString()}`
                        : ''
                    }
                  </p>
                </div>
              </div>`
      }
    </div>`
  }
}
customElements.define('pacer-example', Example)
customElements.define('query-client-provider', QueryClientProvider)
const provider = new QueryClientProvider()
provider.client = queryClient
provider.append(document.createElement('pacer-example'))
document.getElementById('app')!.append(provider)
