# 0003 Shadow and Light DOM Support

## Context

Consumers need both style isolation and integration flexibility.

## Decision

Default to Shadow DOM and allow `shadow: false`.

## Alternatives considered

Shadow-only and light-only rendering.

## Consequences

The runtime supports native slots and isolated styles while still allowing light DOM integration.

## Known limitations

Light DOM styles can leak. Closed Shadow DOM limits diagnostics.
