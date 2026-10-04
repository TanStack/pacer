<script setup lang="ts">
import { PacerProvider } from '@tanstack/vue-pacer/provider'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'
import Counter from './Counter.vue'
import Search from './Search.vue'
import Range from './Range.vue'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]
</script>

<template>
  <!-- Optionally provide default options for every debouncer below. -->
  <PacerProvider>
    <div>
      <Counter />
      <hr />
      <Search />
      <hr />
      <Range />
    </div>
  </PacerProvider>
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
