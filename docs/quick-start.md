---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Pacer installed yet? See the [Installation](./installation.md) page for instructions.

## Understanding Which Pacer Utility to Use

Still learning what TanStack Pacer is and how it can help your application? See the [Which Pacer Utility Should I Choose?](./guides/which-pacer-utility-should-i-choose.md) guide for help choosing which Pacer utility to use. The TanStack Pacer libraries have 5 core utilities, but also quite a few flexible ways to use each utility. Famarilizing yourself with the above guide will help you choose the right utility for your use case.

## API References

See the [API References](./reference/index.md) page for the full list of API references for each Pacer utility.

## Basic Usage

If you are using vanilla JavaScript, there are core classes and functions that you can use from the core pacer package.

### Class Usage

```ts
import { Debouncer } from '@tanstack/pacer' // class

const debouncer = new Debouncer(fn, options)

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

### Function Usage

```ts
import { debounce } from '@tanstack/pacer' // function

const debouncedFn = debounce(fn, options)

debouncedFn(args) // execute the debounced function
```

### Framework Hook Usage (Recommended)

If you are using a framework adapter like React, you can use the `useDebouncer` hook to create a debounced function.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

const debouncer = useDebouncer(fn, options) // recommended

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

### Option Helpers

If want a type-safe way to define common options for pacer utilities, TanStack Pacer provides option helpers for each utility.

```ts
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = new Debouncer(fn, { ...commonDebouncerOptions, key: 'myDebouncer' })
```

### Providers

In each framework adapter, there is a provider component that you can use to provide default options to all instances of a pacer utility.

```tsx
import { PacerProvider } from '@tanstack/react-pacer'

// set default options for react-pacer instances
<PacerProvider defaultOptions={{ debouncer: { wait: 1000 } }}>
  <App />
</PacerProvider>
```

### Devtools

TanStack Pacer provides an official TanStack Devtools integration for each framework adapter. See the [Devtools](./devtools.md) documentation for more information on how to set up and use the Pacer devtools.