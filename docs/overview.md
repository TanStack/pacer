---
title: Overview
id: overview
---

# TanStack Pacer

TanStack Pacer is a powerful, lightweight utility library designed to help developers control the timing and execution of functions across any JavaScript environment. It provides a suite of carefully designed tools for managing the pace of operations in applications, whether you're working with vanilla JavaScript or using frameworks like React, Solid, Vue, Angular, or Svelte.

## Key Features

- **Debouncing**: Prevent function executions until after a specified delay, with control over leading and trailing edge execution.
- **Throttling**: Limit function executions to occur at most once per specified time window.
- **Rate Limiting**: Control how frequently functions can be called over time.
- **Queuing**: Manage the execution order of operations with priority support, FIFO/LIFO ordering, and concurrency control.
- **Async Support**: Special implementations for async functions with comprehensive TypeScript support.
- **Framework Adapters**: Framework-specific hooks and utilities for React, Solid, and more.
- **TypeScript-First**: Full type safety with detailed generics support.

## Why Use TanStack Pacer?

- **Performance Optimization**: Prevent expensive operations from firing too frequently
- **UI Responsiveness**: Smooth out user interactions like typing, scrolling, and resizing
- **API Rate Control**: Manage API call frequency to prevent rate limiting
- **Resource Management**: Control resource-intensive operations
- **Batch Processing**: Group operations for more efficient processing

TanStack Pacer is designed to integrate seamlessly with other TanStack libraries and can be used in any modern JavaScript application. Its modular architecture lets you import only what you need, keeping your bundle size minimal.