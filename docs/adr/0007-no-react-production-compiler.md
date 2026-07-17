# 0007 No-React Production Compiler

## Context

Angular and plain HTML consumers are sensitive to bundle size and do not want React or ReactDOM in production. A runtime wrapper around React components does not satisfy that requirement because it still creates internal React roots.

## Decision

Use React-shaped TSX as an authoring format and compile supported component source into vanilla Custom Elements.

The compiled production output must not import:

- `react`
- `react-dom`
- `react-dom/client`
- `react/jsx-runtime`

The compiled production output must not call `createRoot`.

## Alternatives considered

- Keep React as a peer dependency: rejected for no-React Angular bundles.
- Bundle React inside each component package: rejected for size and duplicate-runtime risk.
- Rewrite React components into Angular components: rejected because the target is platform Custom Elements, not Angular-only code.

## Consequences

- The compiler supports a React-shaped subset rather than full React.
- Unsupported React APIs need diagnostics and documentation.
- The generated runtime owns hook cells, DOM rendering, events, slots, methods, and styles.
- The old React-backed runtime can remain for compatibility, but it is not the default production integration path for Angular/plain HTML consumers.
