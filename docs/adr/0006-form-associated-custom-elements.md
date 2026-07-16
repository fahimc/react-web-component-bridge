# 0006 Form-associated Custom Elements

## Context

Web Components should participate in native forms.

## Decision

Use `ElementInternals` when `form` options are provided.

## Alternatives considered

Manual hidden inputs only.

## Consequences

Native form submission and validity APIs work in supported browsers.

## Known limitations

Unsupported browsers need fallback behavior or consumer-specific adapters.
