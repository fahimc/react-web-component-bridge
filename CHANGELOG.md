# Changelog

## 0.1.0 - 2026-07-16

### Added

- Added the React-compatible facade export `@fahimc/react-web-component-bridge/react`, allowing component authors to keep React code intact while registering Web Component tags with `defineComponentTag`, `createComponentTag`, `defineWebComponent`, or `createWebComponent`.
- Added a side-effect Web Component bundle for the example React components at `@fahimc/react-web-component-bridge-test-components/web-components`.
- Rebuilt the Angular example so it imports the Web Component bundle and renders the React-authored components as custom-element tags.
- Created the `@fahimc/react-web-component-bridge` TypeScript package for wrapping React components as Custom Elements.
- Added `createReactElement`, `defineReactElement`, `defineReactElements`, registry helpers, global configuration, metadata generation, and public TypeScript types.
- Implemented controller-based runtime layers for lifecycle, React rendering, props/attributes, event conversion, slots, styles, portals, public methods, and form-associated custom elements.
- Added a generator package for explicit-definition metadata, `custom-elements.json`, declaration, and Markdown API outputs.
- Added complex test components: customer data grid, searchable customer picker, modal dialog, address form control, and themed dashboard card.
- Added plain HTML, React, Angular, Vue, and complex-component consumer examples.
- Added docs, ADRs, contribution/security files, GitHub issue/PR templates, and local CI workflow definitions.
- Added controller, unit, type, browser smoke, package fixture, API report, size-limit, and performance benchmark coverage.

### Changed

- Made the facade import the recommended authoring API while keeping the lower-level bridge runtime available for advanced and generated integrations.

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
- React remains the runtime renderer under the Web Component boundary; the package does not transpile React source into framework-native Angular code.
- Body-level portals require consumer-provided global styles when Shadow DOM-only styles are insufficient.
