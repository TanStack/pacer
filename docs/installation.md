---
title: Installation
id: installation
---

Pacer packages are ESM-only, target ES2022, and require Node.js 20 or newer when running in Node.js. The Octane adapter requires Node.js 22.22.2 or newer. Ember includes a CommonJS addon metadata shim for its build tooling; its runtime entry points are ESM. Use ESM imports or dynamic `import()` when consuming them.

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

react: @tanstack/react-pacer
solid: @tanstack/solid-pacer
angular: @tanstack/angular-pacer
preact: @tanstack/preact-pacer
vue: @tanstack/vue-pacer
svelte: @tanstack/svelte-pacer
lit: @tanstack/lit-pacer
alpine: @tanstack/alpine-pacer
ember: @tanstack/ember-pacer
octane: @tanstack/octane-pacer

<!-- ::end:tabs -->

Each framework package re-exports everything from the core `@tanstack/pacer` package, so you do not need to install the core package separately.

> [!NOTE]
> Not using a framework? Install the core `@tanstack/pacer` package directly for vanilla JavaScript.

<!-- ::start:framework -->

# React

## Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect your pacers at runtime.

# Solid

## Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect your pacers at runtime.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-pacer-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-pacer-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

# React

See the [devtools](./devtools) page for setup and usage.

# Solid

See the [devtools](./devtools) page for setup and usage.

<!-- ::end:framework -->

Framework guides cover lifecycle ownership, reactive options, selected state, and helper return values:

- [Vue](./framework/vue/adapter.md)
- [Svelte](./framework/svelte/adapter.md)
- [Lit](./framework/lit/adapter.md)
- [Alpine](./framework/alpine/adapter.md)
- [Ember](./framework/ember/adapter.md)
- [Octane](./framework/octane/adapter.md)
