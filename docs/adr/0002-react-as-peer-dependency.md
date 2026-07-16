# 0002 React as Peer Dependency

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
