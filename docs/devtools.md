---
title: Devtools
id: devtools
---

What? My debouncer can have dedicated devtools? Yep!

TanStack Pacer ships devtools for watching and debugging every registered utility in real time. They run as a plugin inside the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> The devtools are excluded from production builds by default, so they add nothing to your production bundle. See [Production builds](#production-builds) if you need them in production.

## Installation

Install the devtools packages for your framework:

### React

```sh
npm install @tanstack/react-devtools @tanstack/react-pacer-devtools
```

### Solid

```sh
npm install @tanstack/solid-devtools @tanstack/solid-pacer-devtools
```

### Angular

```sh
npm install @tanstack/angular-devtools @tanstack/angular-pacer-devtools
```

### Svelte

```sh
npm install @tanstack/svelte-devtools @tanstack/svelte-pacer-devtools
```

### Vue

```sh
npm install @tanstack/vue-pacer-devtools
```

### Preact

```sh
npm install @tanstack/preact-devtools @tanstack/preact-pacer-devtools
```

Alpine, Ember, Lit, and Octane can use the framework-independent panel. They do not have dedicated devtools adapters.

## Basic setup

### React setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  )
}
```

### Solid setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/solid-pacer-devtools'

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  )
}
```

### Angular setup

Add the plugin through the official `provideTanStackDevtools` provider in `app.config.ts`. The provider creates the dock; you do not need to add a component to your template.

```ts
import { isDevMode } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { pacerDevtoolsPlugin } from '@tanstack/angular-pacer-devtools'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode()
      ? [
          provideTanStackDevtools(() => ({
            plugins: [pacerDevtoolsPlugin()],
          })),
        ]
      : []),
  ],
}
```

Keep your existing application providers alongside this provider.


### Svelte setup

Add the dock once in your root component. This example uses Vite's `import.meta.env.DEV` flag to keep the dock out of production builds.

```svelte
<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
</script>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[pacerDevtoolsPlugin()]} />
{/if}
```

In SvelteKit, you can use `dev` from `$app/environment` as the condition instead.


### Vue setup

```vue
<script setup lang="ts">
import { PacerDevtoolsPanel } from '@tanstack/vue-pacer-devtools'
</script>

<template>
  <AppContent />
  <section style="height: 400px"><PacerDevtoolsPanel /></section>
</template>
```

For Angular, Svelte, React, Preact, and Solid, the Pacer panel appears alongside any other TanStack devtools plugins you have installed.


## Production builds

The default imports become no-ops in production builds:

```tsx
// This is a no-op in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'
```

To debug a production issue with full devtools, switch to the production-specific imports:

```tsx
// This includes full devtools even in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools/production'
```

## Registering utilities

A utility only registers with the devtools when you give it a `key`. Leave the option out and the instance stays out of the panels.

```tsx
const debouncer = new Debouncer(myDebounceFn, {
  key: 'My Debouncer', // friendly name shown in the devtools
  wait: 1000,
})
```