# Project Status

## Current phase

Phase 10: release hardening in progress.

## Completed tasks

- Workspace, TypeScript, lint, formatting, build, test, Playwright, and CI scaffolding.
- Core package API and controller-based runtime.
- Generator package and metadata output.
- Complex component examples and framework consumer examples.
- Documentation and ADR baseline.

## Remaining tasks

- Raise automated coverage from the current baseline to the required 90/85/90/90 thresholds.
- Replace placeholder npm publish credentials before publishing.
- Expand browser/device coverage as consumer teams report integration issues.

## Test status

Passing locally: format, lint, TypeScript build mode, unit tests, public API type tests, package build, example builds, Angular build, package pack, and Chromium browser smoke.

Not yet passing: coverage thresholds and full Playwright Firefox/WebKit matrix where browsers are not installed.

## Coverage

Coverage thresholds are configured at 90% statements, 85% branches, 90% functions, and 90% lines.
Current measured baseline: 68.51% statements, 51.82% branches, 88.99% functions, 69.89% lines.

## Known issues

- Body-level portals cannot inherit Shadow DOM-only styles without consumer-provided global styles.
- Angular forms may need app-specific value accessors for unusual object-valued controls.
- SSR import is safe, but custom-element registration is browser-only.
- Coverage hardening remains open before a production release.

## Decisions

- React and ReactDOM are peer dependencies.
- The package wraps React at runtime and does not translate source code.
- Metadata is generated from explicit definitions, not arbitrary source analysis.

## Next actions

- Run full CI in GitHub Actions after the initial push.
- Prepare a Changesets version when npm publication is explicitly requested.
