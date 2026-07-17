# 0001 Runtime Wrapper, Not Source Translator

Status: Superseded by 0007.

## Context

The package exposes React components to non-React consumers.

## Decision

Wrap React components at runtime in Custom Elements. Do not translate React source into another framework.

## Alternatives considered

Source transforms and framework rewrites.

## Consequences

React remains a runtime peer dependency, but component behavior stays faithful to the source component.

This decision was reversed for the Angular/plain HTML production path because consumers require no React in the final bundle.

## Known limitations

SSR cannot render custom elements as React components on the server.
