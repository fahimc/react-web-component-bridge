# Overview

`@codedia/react-to-web-component-compiler` is a build-time compiler for teams that want to author UI in React-shaped TSX and consume the result as browser-native Custom Elements.

The goal is not to mount React inside Angular. The production path removes React imports, lowers TSX to a small DOM runtime, and emits JavaScript that defines custom-element classes. Angular, plain HTML, Vue, and CMS pages import the emitted module once and then use standard element tags.

The companion runtime package, `@codedia/react-to-web-component-runtime`, provides shared Custom Element contracts, metadata helpers, and the optional React-compatible authoring facade. The compiler package is the package most users install as a development dependency.

## What The Module Does

1. Reads React-shaped TSX component source.
2. Reads tag registration metadata from CLI flags, a definition file, or inline `defineComponentTag` calls.
3. Removes `react`, `react-dom`, JSX runtime, and facade imports from the production output.
4. Lowers JSX to a compact virtual-node representation.
5. Replaces supported React APIs with compiler-runtime equivalents.
6. Emits a module that registers one or more Custom Elements.
7. Lets non-React hosts consume the result using normal browser APIs.

## Why It Exists

Many product teams have useful React component code but need to ship UI into Angular, server-rendered HTML, CMS templates, or mixed-framework applications. A React-root wrapper solves interoperability but keeps React and ReactDOM in the consumer bundle. This project targets the stricter case: keep the React-shaped authoring model, but do not ship React to the consumer.
