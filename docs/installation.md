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

## Next steps

Your framework's quick start walks through a first debouncer, then covers selected state, reactive options, async work, default options, and cleanup:

- [React](./framework/react/quick-start.md)
- [Preact](./framework/preact/quick-start.md)
- [Solid](./framework/solid/quick-start.md)
- [Angular](./framework/angular/quick-start.md)
- [Vue](./framework/vue/quick-start.md)
- [Svelte](./framework/svelte/quick-start.md)
- [Lit](./framework/lit/quick-start.md)
- [Alpine](./framework/alpine/quick-start.md)
- [Ember](./framework/ember/quick-start.md)
- [Octane](./framework/octane/quick-start.md)
- [Vanilla JavaScript](./framework/vanilla/quick-start.md)
