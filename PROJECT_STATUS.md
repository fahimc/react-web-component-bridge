# Project Status

## Current phase

Phase 11: React facade rebuild complete pending external publication credentials.

## Completed tasks

- Workspace, TypeScript, lint, formatting, build, test, Playwright, and CI scaffolding.
- Core package API and controller-based runtime.
- React-compatible facade API that re-exports React authoring primitives and adds `defineComponentTag` / `createComponentTag`.
- Generator package and metadata output.
- Complex React component examples, side-effect Web Component registration bundle, and framework consumer examples.
- Angular example rebuilt to import the Web Component bundle and render React-authored components with custom-element tags.
- Netlify-ready documentation website with live React-to-Web-Component preview editor, API support matrix, unsupported behavior notes, and architecture workflow sections.
- Documentation, ADRs, changelog, performance benchmark, and validation status.
- Coverage thresholds met locally.

## Remaining tasks

- Replace placeholder npm publish credentials before publishing.
- Publish GitHub workflow files after refreshing GitHub credentials with the `workflow` scope.
- Expand browser/device coverage as consumer teams report integration issues.

## Test status

Last full baseline passed locally before the facade rebuild: format, lint, TypeScript build mode, unit tests, coverage, public API type tests, package build, example builds, Angular build, bundle-size check, package pack, clean fixture install/import, benchmark, and Playwright Chromium/Firefox/WebKit browser smoke.

Current facade rebuild checks completed: format, lint, TypeScript typecheck, coverage tests, package build, example builds, site build, public API type tests, size-limit, API report, package pack, and Playwright Chromium/Firefox/WebKit browser smoke.

External blocker: remote GitHub workflow files require a token with `workflow` scope.

## Coverage

Coverage thresholds are configured at 90% statements, 85% branches, 90% functions, and 90% lines.
Current measured baseline: 95.71% statements, 85.04% branches, 100% functions, 96.59% lines.

## Known issues

- Body-level portals cannot inherit Shadow DOM-only styles without consumer-provided global styles.
- Angular forms may need app-specific value accessors for unusual object-valued controls.
- SSR import is safe, but custom-element registration is browser-only.
- GitHub rejected remote workflow publication because the available OAuth token lacks `workflow` scope.

## Decisions

- React and ReactDOM are peer dependencies.
- The package wraps React at runtime and does not translate source code.
- The recommended authoring import is `@codedia/react-to-web-component-runtime/react`, so users keep React component code intact while the bridge adapts the exported component to a Web Component tag.
- Metadata is generated from explicit definitions, not arbitrary source analysis.

## Next actions

- Host the Angular example through a Cloudflare Tunnel for review.
- Deploy the documentation website to Netlify.
- Refresh GitHub auth with `gh auth refresh -h github.com -s workflow` and push `.github/workflows`.
- Prepare a Changesets version when npm publication is explicitly requested.
