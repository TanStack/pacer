import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

createApp(App).use(VueQueryPlugin, { queryClient }).mount('#app')
