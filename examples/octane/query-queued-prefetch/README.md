# Octane and Query Core queued prefetch

Hover over posts to schedule prefetches with Pacer and reuse the Query cache when opening a post.

From the repository root, run `pnpm install` and `pnpm build:all`. Then run `pnpm dev` in this directory. Run its browser checks with `pnpm test:e2e`.

Query Core observers subscribe in layout effects and release their subscriptions when each component unmounts. Pacer owns the scheduling; Query Core owns fetching and caching.
