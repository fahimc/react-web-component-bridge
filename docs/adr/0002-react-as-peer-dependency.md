# 0002 React as Peer Dependency

Status: Superseded for compiled production bundles by 0007.

## Context

Consumers often already have React installed.

## Decision

Declare React and ReactDOM as peer dependencies.

## Alternatives considered

Bundling React.

## Consequences

Consumers control React version and avoid duplicate runtimes.

## Known limitations

Misconfigured apps may fail peer resolution.

For the compiler path, Angular/plain HTML consumers should import compiled custom elements and should not need React or ReactDOM in production.
