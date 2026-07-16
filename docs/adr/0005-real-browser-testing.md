# 0005 Real Browser Testing

## Context

JSDOM does not fully model Custom Elements, Shadow DOM, forms, or browser event composition.

## Decision

Use Vitest for unit coverage and Playwright for real browser behavior.

## Alternatives considered

JSDOM-only tests.

## Consequences

CI is slower but catches standards-level integration issues.

## Known limitations

Some browser APIs still vary between engines.
