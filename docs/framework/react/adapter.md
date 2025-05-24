---
title: TanStack Pacer React Adapter
id: adapter
---

If you are using TanStack Pacer in a React application, we recommend using the React Adapter. The React Adapter provides a set of easy-to-use hooks on top of the core Pacer utilities. If you find yourself wanting to use the core Pacer classes/functions directly, the React Adapter will also re-export everything from the core package.

## Installation

```sh
npm install @tanstack/react-pacer
```

## React Hooks

See the [React Functions Reference](../reference/index.md) to see the full list of hooks available in the React Adapter.

## Basic Usage

Import a react specific hook from the React Adapter.

```tsx
import { useDebouncedValue } from '@tanstack/react-pacer'

const [instantValue, instantValueRef] = useState(0)
const [debouncedValue, debouncer] = useDebouncedValue(instantValue, {
  wait: 1000,
})
```

Or import a core Pacer class/function that is re-exported from the React Adapter.

```tsx
import { debounce, Debouncer } from '@tanstack/react-pacer' // no need to install the core package separately
```

