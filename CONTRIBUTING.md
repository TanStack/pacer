---
title: Contributing
id: contributing
---

# Contributing

## Questions

If you have questions about implementation details, help or support, then please use our dedicated community forum at [Github Discussions](https://github.com/tanstack/pacer/discussions) **PLEASE NOTE:** If you choose to instead open an issue for your question, your issue will be immediately closed and redirected to the forum.

## Reporting Issues

If you have found what you think is a bug, first search the [open and closed issues](https://github.com/TanStack/pacer/issues?q=is%3Aissue) to make sure it has not already been reported. If you cannot find an existing report, use the [bug report template](https://github.com/TanStack/pacer/issues/new?template=bug_report.yml). **PLEASE NOTE:** Issues that are identified as implementation questions or non-issues will be immediately closed and redirected to [Github Discussions](https://github.com/tanstack/pacer/discussions).

## Suggesting new features

If you are here to suggest a feature, first create an issue if it does not already exist. From there, we will discuss use-cases for the feature and then finally discuss how it could be implemented.

## Pull Request Guidelines

Every pull request must follow the [TanStack Pacer pull request template](.github/pull_request_template.md). Complete its description and checklist without removing or bypassing the required sections.

- Search the [open and closed pull requests](https://github.com/TanStack/pacer/pulls?q=is%3Apr) before starting work to avoid duplicating an existing contribution.
- Keep each pull request focused on one change or topic. Pull requests that combine unrelated changes will be closed with a request to split them into separately reviewable contributions.
- Write a concise description that clearly explains what changed and why. Follow the sections in the pull request template; a long, unstructured description makes a contribution harder to review.
- You may use AI tools to help generate code, but you remain responsible for understanding, testing, and verifying every submitted change. Do not submit unreviewed, low-quality, or irrelevant generated code.
- Do not mass-submit unrelated or low-quality AI-generated pull requests. We treat that behavior as spam and may close the pull requests, block the contributor, and report the GitHub account.

## Development

Before proceeding with development, ensure you match one of the following criteria:

- Fixing a small bug
- Fixing a larger issue that has been previously discussed and agreed-upon by maintainers
- Adding a new feature that has been previously discussed and agreed-upon by maintainers

## Development Workflow

- Fork this repository, we prefer the `feat-*` branch name style
- Use the Node.js version in `.nvmrc` (`nvm install && nvm use`) and the pnpm version pinned in `package.json`. Keep TypeScript at `6.0.3` during routine dependency updates.
- Ensure you have `pnpm` installed
- Install projects dependencies and linkages by running `pnpm install`
- Auto-build and auto-test files as you edit by running `pnpm dev`
- Implement your changes and tests
- To run examples, follow their individual directions. Usually this includes:
  - cd into the example directory
  - Do NOT install dependencies again or do any linking. Nx already handles this for you. Only run install from the project root.
  - Starting the dev server with `pnpm dev` or `pnpm start` (from the example directory)
- To test in your own projects:
  - Build/watch for changes with `pnpm build`/`pnpm dev`
- Document your changes in the appropriate documentation website markdown pages
- Run `pnpm test` to ensure all tests pass before committing
- Every change that affects a published package must include a changeset. Create the changelog entry with `pnpm changeset`; documentation, CI, and development-only changes do not require one.
- Commit your work and open a pull request
- Submit PR for review

## Adding a new example

- Clone an existing example into the appropriate `examples` directory
- Name it the example name in kebab-case
- Update the new example's package.json to match the new example name and any other details
- Check dependencies for unused packages
- Install any additional packages to the example that you may need
- Update the docs/config.json file to include the new example in the navigation sidebar
- Commit the example eg. `docs: Add example-name`

## Package builds

Packages target ES2022 and require Node.js 20 or newer. They publish ESM and `.d.ts` declarations from `dist`, without CommonJS, source files, or source maps. Preserve all documented subpath exports and the devtools browser/server conditions when changing builds.

`pnpm test` runs the workspace checks, builds, strict publint, packed-file validation, and the existing core size budget. Use the repository’s newer Node.js version for development and CI; the published package runtime minimum is separate.

Package changes require a changeset. Use a minor release for this build migration, including the devtools packages; do not accidentally request a major release.

## Accidental devtools version

Issue [#168](https://github.com/TanStack/pacer/issues/168) tracks the accidental `@tanstack/react-pacer-devtools@0.14.0` release. Its contents predate the current release line, but update tools can choose it as the highest stable version. Moving the `latest` tag does not change that ordering.

Run `pnpm release:deprecate-devtools` to inspect the fixed deprecation target and message. An npm maintainer can run `pnpm release:deprecate-devtools --apply` to deprecate only that version. The command verifies its package name, version, and obsolete core dependency before writing npm metadata. It does not remove the package or change its contents. Verify the deprecation in npm and in the supported update tools afterward; their treatment of deprecated versions depends on their configuration.

`pnpm release:check` rejects stable workspace versions below a higher, non-deprecated npm release. The publish command runs this check before publishing, so the accidental version must be deprecated or superseded before another stable release. Offline policy tests run through `pnpm test:release`. No npm metadata changes occur during tests or preview mode.
