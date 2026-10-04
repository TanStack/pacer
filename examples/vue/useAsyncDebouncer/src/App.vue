<script setup lang="ts">
import { PacerProvider } from '@tanstack/vue-pacer/provider'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import Example from './Example.vue'
import { ref, onMounted, onUnmounted } from 'vue'
const mounted = ref(true)
function toggleMounted(event: KeyboardEvent) {
  if (event.shiftKey && event.key === 'Enter') mounted.value = !mounted.value
}
onMounted(() => document.addEventListener('keydown', toggleMounted))
onUnmounted(() => document.removeEventListener('keydown', toggleMounted))
const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]
</script>
<template>
  <PacerProvider><Example v-if="mounted" /></PacerProvider
  ><TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
