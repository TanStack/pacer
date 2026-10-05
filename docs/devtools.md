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
npm install @tanstack/vue-devtools @tanstack/vue-pacer-devtools
```

### Preact

```sh
npm install @tanstack/preact-devtools @tanstack/preact-pacer-devtools
```

### Lit, Alpine, Ember, and Octane

```sh
npm install @tanstack/devtools @tanstack/pacer-devtools
```

These frameworks use the framework-independent Pacer plugin inside the TanStack Devtools dock.

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
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]
</script>

<template>
  <AppContent />
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
```

The Pacer panel appears alongside any other TanStack Devtools plugins you have installed.

### Lit, Alpine, Ember, and Octane setup

These frameworks use `TanStackDevtoolsCore` to mount the dock and `pacerDevtoolsPlugin()` to add the Pacer panel. Mount one dock for your application and unmount it with the owning component.

Create a shared mount function. The following examples use Vite's development flag.

```ts
// devtools.ts
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

export function mountDevtools() {
  if (!import.meta.env.DEV) return () => {}

  const target = document.createElement('div')
  document.body.append(target)
  const devtools = new TanStackDevtoolsCore({
    plugins: [pacerDevtoolsPlugin()],
  })
  devtools.mount(target)

  return () => {
    devtools.unmount()
    target.remove()
  }
}
```

#### Lit

Mount in `connectedCallback` and clean up in `disconnectedCallback`. This also supports removing and reconnecting the application element.

```ts
import { LitElement, html } from 'lit'
import { mountDevtools } from './devtools'

class App extends LitElement {
  private cleanupDevtools?: () => void

  override connectedCallback() {
    super.connectedCallback()
    this.cleanupDevtools = mountDevtools()
  }

  override disconnectedCallback() {
    this.cleanupDevtools?.()
    this.cleanupDevtools = undefined
    super.disconnectedCallback()
  }

  override render() {
    return html`<slot></slot>`
  }
}

customElements.define('pacer-app', App)
```

#### Alpine

Give the dock its own Alpine component so that it has one lifecycle owner.

```ts
import Alpine from 'alpinejs'
import { mountDevtools } from './devtools'

Alpine.data('devtools', () => {
  let cleanup: (() => void) | undefined
  return {
    init() {
      cleanup = mountDevtools()
    },
    destroy() {
      cleanup?.()
    },
  }
})

Alpine.start()
```

```html
<div x-data="devtools"></div>
```

#### Ember

Mount after rendering and register cleanup on the component. Check its lifecycle state because it can be destroyed before the scheduled callback runs.

```gts
import Component from '@glimmer/component'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { mountDevtools } from './devtools'

export default class App extends Component {
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    if (import.meta.env.DEV) {
      scheduleOnce('afterRender', this, this.mountDevtools)
    }
  }

  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    registerDestructor(this, mountDevtools())
  }

  <template>{{yield}}</template>
}
```

#### Octane

Mount the dock in a layout effect and return its cleanup function. With Octane 0.1.36, keep application click and input events inside the Octane root. The dock uses Solid internally; both renderers use the same delegated event property names, which can otherwise invoke application handlers twice. The dock target created above is outside this boundary.

```tsx
import { useLayoutEffect } from 'octane'
import { mountDevtools } from './devtools'

function App() {
  useLayoutEffect(mountDevtools, [])

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
      <AppContent />
    </div>
  )
}
```

For a Vite workspace example, keep Pacer's registry shared between the adapter and the devtools. Add `@tanstack/pacer` as a direct dependency and use these optimization settings alongside your Octane plugin:

```ts
optimizeDeps: {
  exclude: ['@tanstack/pacer'],
  include: [
    '@tanstack/devtools',
    '@tanstack/pacer-devtools',
    '@tanstack/octane-pacer > @tanstack/pacer > @tanstack/store',
    '@tanstack/octane-pacer > @tanstack/pacer > @tanstack/devtools-event-client',
  ],
},
```

The [Octane debouncer example](./framework/octane/examples/useDebouncer) includes this configuration and a live devtools plugin.

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
