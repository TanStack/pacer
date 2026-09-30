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

Coming soon...

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

Use a unique key for each utility you want to inspect. A newer instance with the same key replaces the stored instance.

The panel can mount after your keyed utilities are created. With matching current core and devtools packages, it replays registered instances and receives later updates even if the event transport stopped reconnecting. Older core packages without the instance-subscription API retain their existing event-bus behavior, so update `@tanstack/pacer` as well as your framework devtools package to get late discovery.

Unmounting the panel removes its subscriptions. Keyed instances remain in the core registry until another instance replaces the same key.
