<script setup lang="ts">
import { PacerProvider } from '@tanstack/vue-pacer/provider'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import Example from './Example.vue'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]
</script>
<template>
  <PacerProvider
    ><div>
      <Example />
      <hr /></div></PacerProvider
  ><TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
