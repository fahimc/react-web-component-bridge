# Changelog

## 0.1.2 - 2026-07-20

### Changed

- Updated package metadata, package READMEs, and the website GitHub link to the renamed repository URL: `https://github.com/fahimc/react-to-web-component-compiler`.

## 0.1.1 - 2026-07-20

### Changed

- Renamed the published runtime package to `@codedia/react-to-web-component-runtime`.
- Renamed the published compiler package and primary CLI to `@codedia/react-to-web-component-compiler` / `react-to-web-component-compiler`.
- Kept `react-web-component-bridge` as a backwards-compatible CLI alias for existing scripts.
- Updated documentation, examples, generated bundles, and runtime diagnostics to use the new naming.

## 0.1.0 - 2026-07-16

### Added

- Added a no-React compiler in the generator package with `compile` and `compile-folder` CLI commands. It compiles React-shaped TSX plus `defineComponentTag` metadata into vanilla Custom Element modules with no `react`, `react-dom`, JSX runtime import, or `createRoot`.
- Added compiler-runtime support for the previously unsupported React-shaped APIs: context, reducers, effects, forwarded refs, imperative handles, portals, lazy/Suspense fallbacks, transition/deferred-value shims, external-store subscriptions, and common element helpers.
- Added external compiler registration metadata so existing components can keep `import React from "react"` and still compile into Web Components via `--tag` / `--component` or `--definition`.
- Added a compiled Angular example bundle generated from `examples/angular-consumer/src/react-components.tsx`; the Angular production build no longer depends on React or the React-backed test component package.
- Added ADR 0007 and rewrote architecture, performance, limitations, troubleshooting, README, and website copy around the compiler-first no-React production path.
- Added `replace-react-imports` / `migrate-react-imports` generator CLI commands and exported utilities for replacing exact `react` imports in a folder with the bridge React facade import.
- Expanded architecture documentation with runtime, controller-stack, and React API translation diagrams.
- Added a Netlify-ready documentation website in `site/` with a generated hero asset, live React-to-Web-Component preview editor, module documentation, supported API matrix, unsupported behavior notes, and architecture workflow page sections.
- Added the React-compatible facade export `@codedia/react-to-web-component-runtime/react`, allowing component authors to keep React code intact while registering Web Component tags with `defineComponentTag`, `createComponentTag`, `defineWebComponent`, or `createWebComponent`.
- Added a side-effect Web Component bundle for the example React components at `@codedia/react-to-web-component-test-components/web-components`.
- Rebuilt the Angular example so it imports the Web Component bundle and renders the React-authored components as custom-element tags.
- Created the `@codedia/react-to-web-component-runtime` TypeScript package for wrapping React components as Custom Elements.
- Added `createReactElement`, `defineReactElement`, `defineReactElements`, registry helpers, global configuration, metadata generation, and public TypeScript types.
- Implemented controller-based runtime layers for lifecycle, React rendering, props/attributes, event conversion, slots, styles, portals, public methods, and form-associated custom elements.
- Added a generator package for explicit-definition metadata, `custom-elements.json`, declaration, and Markdown API outputs.
- Added complex test components: customer data grid, searchable customer picker, modal dialog, address form control, and themed dashboard card.
- Added plain HTML, React, Angular, Vue, and complex-component consumer examples.
- Added docs, ADRs, contribution/security files, GitHub issue/PR templates, and local CI workflow definitions.
- Added controller, unit, type, browser smoke, package fixture, API report, size-limit, and performance benchmark coverage.

### Changed

- Changed the intended Angular/plain HTML production architecture from a React-backed runtime bridge to a compiler-first custom-element output.
- Made the facade import the recommended authoring API while keeping the lower-level bridge runtime available for advanced and generated integrations.
- Added `build:site`, `dev:site`, and Netlify configuration for deploying the website from this repository.

### Validation

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:types`
- `pnpm build`
- `pnpm build:examples`
- `pnpm size`
- `pnpm pack:core`
- `pnpm api`
- `pnpm bench`
- Clean fixture tarball install and Node import
- Playwright Chromium, Firefox, and WebKit smoke

### Known Limitations

- npm publication is not performed without an explicit publish instruction and npm credentials.
- Remote GitHub workflow publication requires a GitHub token with the `workflow` scope.
- The no-React compiler supports a React-shaped subset, not arbitrary React applications. Unsupported APIs such as context, portals, Suspense, lazy loading, transitions, and full React effect timing need explicit adapters or future compiler work.
- The legacy React-backed runtime remains available for compatibility, but it is not the correct production path for Angular/plain HTML consumers that require no React in the final bundle.
- Body-level portals require consumer-provided global styles when Shadow DOM-only styles are insufficient.
