---
title: Installation
id: installation
---

You can install TanStack Pacer with any [NPM](https://npmjs.com) package manager.

Only install one of the following packages depending on your use case:

## React

```sh
npm install @tanstack/react-pacer
```

TanStack Pacer is compatible with React v16.8+

## Solid

```sh
npm install @tanstack/solid-pacer
```

TanStack Pacer is compatible with Solid v1.9.5+

## Vanilla JS

```sh
npm install @tanstack/pacer
```

Install the the core `@tanstack/pacer` package to use with any framework or without a framework. Each framework package up above will also re-export everything from this core package.

> [!IMPORTANT] There's no need to install the `@tanstack/pacer` core package if you've already installed one of the above framework packages.

## Devtools (Optional)

To use the devtools for debugging and monitoring, install both the framework devtools and the Pacer devtools packages:

### React Devtools

```sh
npm install @tanstack/react-devtools @tanstack/react-pacer-devtools
```

### Solid Devtools

```sh
npm install @tanstack/solid-devtools @tanstack/solid-pacer-devtools
```

See the [devtools](https://pacer.tanstack.com/docs/devtools) documentation for more information on how to set up and use the Pacer devtools.