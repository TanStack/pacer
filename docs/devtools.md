---
title: Devtools
id: devtools
---

What? My debouncer can have dedicated devtools? Yep!

TanStack Pacer provides devtools for debugging and monitoring all your utilities in real-time. The devtools integrate seamlessly within the new [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE] By default, the TanStack Devtools and TanStack Pacer Devtools will only be included in development mode. This helps keep your production bundle size minimal. If you need to include devtools in production builds (e.g., for debugging production issues), you can use the alternative "production" imports.

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

## Basic Setup

### React Setup

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

### Solid Setup

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

## Production Builds

By default, devtools are excluded from production builds to minimize bundle size. The default imports will return no-op implementations in production:

```tsx
// This will be a no-op in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'
```

If you need to include devtools in production builds (e.g., for debugging production issues), use the production-specific imports:

```tsx
// This will include full devtools even in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools/production'
```

## Registering Utilities

Each utility should automatically be detected and displayed in the devtools. However, if you don't provide a `key` option to the utility, it will show with a uuid for its name. Give it an identifiable name with the `key` option.

```tsx
const debouncer = new Debouncer(myDebounceFn, {
  key: 'My Debouncer', // friendly name for the utility instead of auto-generated uuid
  wait: 1000,
})
```