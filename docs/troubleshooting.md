# Troubleshooting

## The compiled bundle still contains React

Run a direct scan on the built artifact:

```bash
rg -n 'react-dom|createRoot|ReactDOM|from "react"|from '\''react'\''' dist
```

If it matches, check that Angular imports the compiler output, not the legacy React-backed runtime package.

## A React-shaped API behaves differently from React

The compiler implements React-shaped APIs on top of Custom Elements and the browser DOM. It does not import React to preserve exact scheduler or reconciler behavior.

Common differences:

- effects run from custom-element lifecycle queues,
- transitions are synchronous compatibility shims,
- lazy components rerender the owning custom element after resolution,
- portals render into browser DOM containers without ReactDOM,
- public imperative APIs should still be exposed with `methods` metadata for Angular/HTML hosts.

## Object props are strings

Use `attribute: false` and assign the value as a DOM property.

```ts
picker.customers = customers;
```

## Events are not heard outside Shadow DOM

Compiled event metadata dispatches `CustomEvent` with `bubbles: true` and `composed: true` by default. Check that the callback prop is listed in `events`.

## Registration throws on the server

Custom-element registration needs a browser `customElements` registry. Import compiled element bundles only in browser/client entry points.
