import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { queryClient } from './api'

createApp(App).use(VueQueryPlugin, { queryClient }).mount('#app')
