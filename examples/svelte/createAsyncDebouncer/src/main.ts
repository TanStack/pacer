import { mount, unmount } from 'svelte'
import App from './App.svelte'

const target = document.getElementById('app')!
let app: ReturnType<typeof mount> | undefined = mount(App, { target })

// Toggle the whole example to try its unmount cleanup.
document.addEventListener('keydown', async (event: KeyboardEvent) => {
  if (!event.shiftKey || event.key !== 'Enter') return
  if (app) {
    const previous = app
    app = undefined
    await unmount(previous)
  } else {
    app = mount(App, { target })
  }
})
