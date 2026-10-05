import { createApp } from 'vue'
import App from './App.vue'

const target = document.getElementById('app')!
let app: ReturnType<typeof createApp> | undefined = createApp(App)
app.mount(target)

// Toggle the whole example to try its unmount cleanup.
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (!event.shiftKey || event.key !== 'Enter') return
  if (app) {
    app.unmount()
    app = undefined
  } else {
    app = createApp(App)
    app.mount(target)
  }
})
